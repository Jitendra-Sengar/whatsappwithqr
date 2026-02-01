"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Check, Loader2, Shield, CreditCard } from "lucide-react"
import { handlePaymentSuccess } from "@/lib/actions/billing"

const plans: Record<string, { name: string; features: string[] }> = {
  starter: {
    name: "Starter",
    features: [
      "Up to 5 WhatsApp sessions",
      "10,000 messages/month",
      "Basic webhooks",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    features: [
      "Unlimited WhatsApp sessions",
      "Unlimited messages",
      "Advanced webhooks",
      "Priority support",
      "Custom integrations",
    ],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const orderId = searchParams.get("order_id")
  const planId = searchParams.get("plan") || "starter"
  const amount = parseInt(searchParams.get("amount") || "0") / 100
  
  const plan = plans[planId] || plans.starter

  async function handlePayment() {
    setLoading(true)
    setError(null)
    
    // In production, this would trigger Razorpay checkout
    // For now, simulate payment success
    const mockPaymentId = `pay_${Date.now()}`
    const mockSignature = "mock_signature"
    
    const result = await handlePaymentSuccess(orderId!, mockPaymentId, mockSignature)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    
    router.push("/dashboard/billing?success=true")
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Invalid checkout session</p>
            <Button className="w-full mt-4" onClick={() => router.push("/dashboard/billing")}>
              Return to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircle className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Upgrade</CardTitle>
          <CardDescription>
            Subscribe to Warest {plan.name} plan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Plan Summary */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{plan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">Rs. {amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          {/* Payment Button */}
          <Button 
            className="w-full h-12 gap-2" 
            size="lg"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay Rs. {amount.toLocaleString()}
              </>
            )}
          </Button>
          
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secured by Razorpay. Your payment information is encrypted.</span>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
