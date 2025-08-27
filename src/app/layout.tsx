// src/app/layout.tsx
import {
  Bricolage_Grotesque,
  Inter,
  Outfit,
  Roboto,
  Roboto_Mono,
  Spectral
} from 'next/font/google'
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/lib/utils/env'

import './globals.css'

const fontRobotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto-mono'
})

const fontOutfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit'
})

const fontInter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter'
})

const fontRoboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto'
})

const fontSpectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-spectral'
})

const fontBricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bricolage-grotesque'
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
        className={`${fontRobotoMono.variable} ${fontOutfit.variable} ${fontInter.variable} ${fontRoboto.variable} ${fontSpectral.variable} ${fontBricolageGrotesque.variable} antialiased`}
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
