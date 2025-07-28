import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from './db'
import { Resend } from 'resend'
import { sendOTPEmail } from './email/service'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  emailAndPassword: {
    enabled: false,
    requireEmailVerification: process.env.NODE_ENV === 'production',
    autoSignIn: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  plugins: [
    nextCookies(),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      async sendVerificationOTP({ email, otp, type }) {
        console.log('sendVerificationOTP', email, otp, type)
        await sendOTPEmail({
          email,
          otp,
          type: type === 'email-verification' ? 'sign-up' : 'sign-in'
        })
      }
    })
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
