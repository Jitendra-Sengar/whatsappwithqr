import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Smartphone,
  Zap,
  Shield,
  Globe,
  Code,
  ArrowRight,
  Check,
  Star,
} from "lucide-react"

const features = [
  {
    icon: Smartphone,
    title: "Multi-Session Management",
    description: "Connect and manage multiple WhatsApp sessions simultaneously with QR code authentication.",
  },
  {
    icon: Code,
    title: "Powerful REST API",
    description: "Full-featured API for sending messages, media, managing contacts, and more.",
  },
  {
    icon: Zap,
    title: "Real-time Webhooks",
    description: "Receive instant notifications for messages, status updates, and connection events.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, role-based access control, and audit logging.",
  },
  {
    icon: Globe,
    title: "Multi-tenant Architecture",
    description: "Isolated environments for each organization with dedicated resources.",
  },
  {
    icon: Star,
    title: "Premium Support",
    description: "Dedicated support team and comprehensive documentation for seamless integration.",
  },
]

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for testing and small projects",
    features: ["1 WhatsApp session", "1,000 messages/month", "Basic API access", "Community support"],
  },
  {
    name: "Starter",
    price: "1,999",
    description: "For growing businesses",
    features: ["5 WhatsApp sessions", "10,000 messages/month", "Full API access", "Webhook support", "Email support"],
    popular: true,
  },
  {
    name: "Professional",
    price: "4,999",
    description: "For scaling operations",
    features: ["25 WhatsApp sessions", "100,000 messages/month", "Priority API access", "Advanced webhooks", "Priority support", "Custom integrations"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: ["Unlimited sessions", "Unlimited messages", "Dedicated infrastructure", "SLA guarantee", "24/7 support", "On-premise option"],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">Warest</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">by Sengar Infotech</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              API Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Trusted by 500+ businesses in India
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              WhatsApp Business API
              <span className="text-primary"> Made Simple</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance">
              Warest is a powerful, multi-tenant WhatsApp Business API platform that helps you 
              automate customer communication at scale. Built for Indian businesses by Sengar Infotech.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">
                  <Code className="mr-2 h-4 w-4" />
                  View API Docs
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                99.9% uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for WhatsApp automation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform for managing WhatsApp Business communications at enterprise scale.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that best fits your business needs. All prices in INR.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border bg-card p-6 ${
                  plan.popular ? 'border-primary ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  {plan.price === 'Custom' ? (
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Rs.</span>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your customer communication?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join 500+ Indian businesses using Warest to automate WhatsApp messaging.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground">Warest</span>
                <span className="text-xs text-muted-foreground ml-2">by Sengar Infotech</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">API Docs</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 Sengar Infotech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
