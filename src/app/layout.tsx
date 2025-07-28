import type { Metadata } from 'next'
import { Poppins, Roboto } from 'next/font/google'
import './globals.css'

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
})

const fontRoboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto'
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
        className={`${fontPoppins.variable} ${fontRoboto.variable} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  )
}
