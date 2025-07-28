import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { sendOTPEmail } from './email/service'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  emailAndPassword: {
    enabled: false
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      async sendVerificationOTP({ email, otp, type }) {
        console.log('sendVerificationOTP', email, otp, type)
        const result = await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>',
          to: ['ante.bucan.st@gmail.com'],
          subject: 'Your KeyVaultify verification code',
          html: `<p>Your KeyVaultify verification code is: ${otp}. This code will expire in 10 minutes.</p>`
        })
        console.log('result', result)
      }
    })
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
