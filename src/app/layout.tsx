// src/app/layout.tsx
import { Bricolage_Grotesque, Spectral } from 'next/font/google'
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/lib/utils/env'

import './globals.css'

// Inter, Outfit, Roboto, Roboto_Mono, Spectral

const fontBricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bricolage-grotesque'
})

const fontSpectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-spectral'
})

export const metadata: Metadata = {
  title: 'Keyvaultify - ENV Management',
  description: 'Keyvaultify - ENV Management'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontBricolageGrotesque.variable} ${fontSpectral.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          // enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
