import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { sendOTPEmail } from './email/service'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async ({}) => {
        try {
          ;(await cookies()).delete('better-auth.session_token')
          redirect('/auth')
        } catch (error) {
          console.error('Error during post-delete cleanup:', error)
          redirect('/auth') // Fallback redirect
        }
      }
    }
  },
  emailAndPassword: {
    enabled: false
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      prompt: 'select_account'
    },
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({
          email,
          type: 'sign-in',
          otp
        })
      }
    })
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
