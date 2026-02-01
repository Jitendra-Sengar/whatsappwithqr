import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import crypto from 'crypto'

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const event = JSON.parse(body)
    
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break
        
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity)
        break
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity)
        break
        
      default:
        console.log(`Unhandled Razorpay event: ${event.event}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentCaptured(payment: any) {
  const orderId = payment.order_id
  const paymentId = payment.id
  
  // Update payment record
  await sql`
    UPDATE payments 
    SET razorpay_payment_id = ${paymentId}, status = 'completed', updated_at = NOW()
    WHERE razorpay_order_id = ${orderId}
  `
  
  // Get payment to find tenant
  const paymentRecord = await sql`
    SELECT * FROM payments WHERE razorpay_order_id = ${orderId}
  `
  
  if (paymentRecord.length === 0) return
  
  const tenantId = paymentRecord[0].tenant_id
  const amount = paymentRecord[0].amount
  
  // Determine plan
  let newPlan = 'starter'
  if (amount >= 4999) {
    newPlan = 'professional'
  }
  
  // Update tenant and subscription
  await sql`UPDATE tenants SET plan = ${newPlan}, updated_at = NOW() WHERE id = ${tenantId}`
  
  await sql`
    UPDATE subscriptions 
    SET plan = ${newPlan}, status = 'active',
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE tenant_id = ${tenantId}
  `
}

async function handlePaymentFailed(payment: any) {
  const orderId = payment.order_id
  
  await sql`
    UPDATE payments 
    SET status = 'failed', updated_at = NOW()
    WHERE razorpay_order_id = ${orderId}
  `
}

async function handleSubscriptionActivated(subscription: any) {
  const subscriptionId = subscription.id
  
  await sql`
    UPDATE subscriptions 
    SET razorpay_subscription_id = ${subscriptionId}, status = 'active', updated_at = NOW()
    WHERE razorpay_subscription_id = ${subscriptionId}
  `
}

async function handleSubscriptionCancelled(subscription: any) {
  const subscriptionId = subscription.id
  
  await sql`
    UPDATE subscriptions 
    SET status = 'cancelled', updated_at = NOW()
    WHERE razorpay_subscription_id = ${subscriptionId}
  `
  
  // Get tenant and downgrade at period end
  const sub = await sql`
    SELECT tenant_id FROM subscriptions WHERE razorpay_subscription_id = ${subscriptionId}
  `
  
  if (sub.length > 0) {
    await sql`
      INSERT INTO activity_logs (tenant_id, action, resource_type, details)
      VALUES (${sub[0].tenant_id}, 'subscription_cancelled_webhook', 'subscription', '{}')
    `
  }
}
