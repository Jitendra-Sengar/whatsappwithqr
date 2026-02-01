import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Download, ArrowUpRight } from "lucide-react"
import { PlanUpgradeButton } from "@/components/billing/plan-upgrade-button"

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for testing',
    features: ['1 WhatsApp session', '1,000 messages/month', 'Basic API access', 'Community support'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 1999,
    description: 'For growing businesses',
    features: ['5 WhatsApp sessions', '10,000 messages/month', 'Full API access', 'Webhook support', 'Email support'],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 4999,
    description: 'For scaling operations',
    features: ['25 WhatsApp sessions', '100,000 messages/month', 'Priority API access', 'Advanced webhooks', 'Priority support', 'Custom integrations'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'For large organizations',
    features: ['Unlimited sessions', 'Unlimited messages', 'Dedicated infrastructure', 'SLA guarantee', '24/7 support', 'On-premise option'],
  },
]

async function getSubscription(tenantId: string) {
  const subscription = await sql`
    SELECT * FROM subscriptions WHERE tenant_id = ${tenantId} LIMIT 1
  `
  return subscription[0] || null
}

async function getPaymentHistory(tenantId: string) {
  const payments = await sql`
    SELECT * FROM payments 
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
    LIMIT 10
  `
  return payments
}

export default async function BillingPage() {
  const session = await getSession()
  if (!session) return null
  
  const subscription = await getSubscription(session.tenant.id)
  const payments = await getPaymentHistory(session.tenant.id)
  
  const currentPlan = plans.find(p => p.id === session.tenant.plan) || plans[0]
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods.
          </p>
        </div>
      </div>
      
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current subscription and usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">{currentPlan.name}</h3>
                  <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                    {subscription?.status || 'Active'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan.price ? `Rs. ${currentPlan.price.toLocaleString()}/month` : 'Free forever'}
                </p>
              </div>
            </div>
            {session.tenant.plan !== 'enterprise' && (
              <Button variant="outline" asChild>
                <a href="#plans">
                  Upgrade Plan
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          
          {subscription && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Billing Period</p>
                  <p className="font-medium text-foreground">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="font-medium text-foreground">
                    {currentPlan.price ? `Rs. ${currentPlan.price.toLocaleString()}` : 'Free'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground">
                    {subscription.razorpay_subscription_id ? 'Razorpay' : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Available Plans */}
      <div id="plans">
        <h2 className="text-xl font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary' : ''} ${plan.id === session.tenant.plan ? 'bg-muted/50' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-sm text-muted-foreground">Rs.</span>
                      <span className="text-3xl font-bold text-foreground">{plan.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === session.tenant.plan ? (
                  <Button disabled className="w-full">Current Plan</Button>
                ) : plan.price === null ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:sales@sengarinfotech.com">Contact Sales</a>
                  </Button>
                ) : (
                  <PlanUpgradeButton 
                    planId={plan.id} 
                    planName={plan.name}
                    price={plan.price}
                    currentPlan={session.tenant.plan}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Your recent payments and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">
                      Rs. {payment.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
