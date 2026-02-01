"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createCheckoutSession } from "@/lib/actions/billing"

interface PlanUpgradeButtonProps {
  planId: string
  planName: string
  price: number
  currentPlan: string
}

export function PlanUpgradeButton({ planId, planName, price, currentPlan }: PlanUpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  
  const isUpgrade = ['free', 'starter', 'professional'].indexOf(planId) > 
    ['free', 'starter', 'professional'].indexOf(currentPlan)
  
  async function handleClick() {
    setLoading(true)
    
    try {
      const result = await createCheckoutSession(planId)
      
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result?.error) {
        alert(result.error)
      }
    } catch (error) {
      alert('Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button 
      onClick={handleClick}
      disabled={loading}
      variant={isUpgrade ? 'default' : 'outline'}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        isUpgrade ? `Upgrade to ${planName}` : `Switch to ${planName}`
      )}
    </Button>
  )
}
