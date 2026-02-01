import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Warest - WhatsApp Business API Platform | Sengar Infotech",
  description: "Enterprise-grade WhatsApp Business API platform for seamless communication automation. Built by Sengar Infotech.",
  keywords: ["WhatsApp API", "Business Messaging", "Communication Platform", "Sengar Infotech", "Warest"],
  authors: [{ name: "Sengar Infotech" }],
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
