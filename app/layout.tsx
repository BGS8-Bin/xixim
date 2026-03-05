import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "XIXIM CRM - Clúster de Innovación y Tecnología Durango",
  description: "Plataforma de gestión empresarial para cámaras, clústeres y organismos coordinadores",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/xixim-1.webp",
      },
    ],
    apple: "/images/xixim-1.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
