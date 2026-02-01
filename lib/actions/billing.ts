'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

const planPrices: Record<string, number> = {
  free: 0,
  starter: 199900, // in paise (Rs. 1999)
  professional: 499900, // in paise (Rs. 4999)
}

export async function createCheckoutSession(planId: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  
  // Only owner can change billing
  if (session.user.role !== 'owner') {
    return { error: 'Only the organization owner can manage billing' }
  }
  
  const amount = planPrices[planId]
  if (amount === undefined) {
    return { error: 'Invalid plan' }
  }
  
  if (amount === 0) {
    // Downgrade to free
    await sql`
      UPDATE tenants SET plan = 'free', updated_at = NOW()
      WHERE id = ${session.tenant.id}
    `
    
    await sql`
      UPDATE subscriptions 
      SET plan = 'free', status = 'active', updated_at = NOW()
      WHERE tenant_id = ${session.tenant.id}
    `
    
    revalidatePath('/dashboard/billing', 'max')
    return { success: true }
  }
  
  // For paid plans, create Razorpay order
  // In production, this would integrate with Razorpay API
  // For now, we'll simulate the checkout URL
  
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  // Store pending payment
  await sql`
    INSERT INTO payments (tenant_id, razorpay_order_id, amount, currency, status)
    VALUES (${session.tenant.id}, ${orderId}, ${amount / 100}, 'INR', 'pending')
  `
  
  // In production, create actual Razorpay order:
  /*
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: orderId,
      notes: {
        tenant_id: session.tenant.id,
        plan_id: planId,
      },
    }),
  })
  const order = await response.json()
  */
  
  // Return checkout URL (in production, this would be handled by Razorpay checkout)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const checkoutUrl = `${baseUrl}/checkout?order_id=${orderId}&plan=${planId}&amount=${amount}`
  
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'checkout_initiated', 'subscription', ${JSON.stringify({ plan: planId, amount: amount / 100 })})
  `
  
  return { checkoutUrl, orderId }
}

export async function handlePaymentSuccess(orderId: string, paymentId: string, signature: string) {
  // Verify Razorpay signature in production
  /*
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    return { error: 'Invalid signature' }
  }
  */
  
  // Get payment record
  const payment = await sql`
    SELECT * FROM payments WHERE razorpay_order_id = ${orderId}
  `
  
  if (payment.length === 0) {
    return { error: 'Payment not found' }
  }
  
  const paymentRecord = payment[0]
  
  // Update payment status
  await sql`
    UPDATE payments 
    SET razorpay_payment_id = ${paymentId}, status = 'completed', updated_at = NOW()
    WHERE razorpay_order_id = ${orderId}
  `
  
  // Determine new plan based on amount
  let newPlan = 'starter'
  if (paymentRecord.amount >= 4999) {
    newPlan = 'professional'
  }
  
  // Update tenant plan
  await sql`
    UPDATE tenants SET plan = ${newPlan}, updated_at = NOW()
    WHERE id = ${paymentRecord.tenant_id}
  `
  
  // Update subscription
  await sql`
    UPDATE subscriptions 
    SET plan = ${newPlan}, status = 'active', 
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE tenant_id = ${paymentRecord.tenant_id}
  `
  
  revalidatePath('/dashboard/billing', 'max')
  revalidatePath('/dashboard', 'max')
  
  return { success: true }
}

export async function cancelSubscription() {
  const session = await getSession()
  if (!session) redirect('/login')
  
  if (session.user.role !== 'owner') {
    return { error: 'Only the organization owner can cancel the subscription' }
  }
  
  await sql`
    UPDATE subscriptions 
    SET status = 'cancelled', updated_at = NOW()
    WHERE tenant_id = ${session.tenant.id}
  `
  
  // Downgrade to free at end of billing period
  await sql`
    INSERT INTO activity_logs (tenant_id, user_id, action, resource_type, details)
    VALUES (${session.tenant.id}, ${session.user.id}, 'subscription_cancelled', 'subscription', '{}')
  `
  
  revalidatePath('/dashboard/billing', 'max')
  
  return { success: true }
}
