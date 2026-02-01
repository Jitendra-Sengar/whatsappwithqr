import Link from "next/link"
import { MessageCircle } from "lucide-react"

interface AuthLayoutServerProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayoutServer({ children, title, subtitle }: AuthLayoutServerProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">Warest</span>
                <p className="text-sm text-white/70">by Sengar Infotech</p>
              </div>
            </Link>
          </div>
          
          <div className="space-y-6">
            <blockquote className="text-xl font-medium leading-relaxed text-balance">
              &ldquo;Warest has transformed how we communicate with our customers. 
              The multi-session management and API integration have been game-changers 
              for our business operations.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                RK
              </div>
              <div>
                <p className="font-semibold">Rahul Kumar</p>
                <p className="text-sm text-white/70">CTO, TechVentures India</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-300" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-300" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-300" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">Warest</span>
                <p className="text-xs text-muted-foreground">by Sengar Infotech</p>
              </div>
            </Link>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
