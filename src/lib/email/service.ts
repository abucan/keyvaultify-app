import React from 'react'
import { render } from '@react-email/render'
import { resend, emailConfig } from './resend'
import { OTPEmail } from './templates'

// Email service class for organized email sending
export class EmailService {
  /**
   * Send OTP verification email
   */
  static async sendOTP(params: {
    email: string
    otp: string
    type: 'sign-in' | 'sign-up'
  }) {
    const { email, otp, type } = params

    try {
      const emailHtml = await render(
        React.createElement(OTPEmail, {
          otp,
          type,
          email
        })
      )

      const subject =
        type === 'sign-in'
          ? 'Your KeyVaultify sign-in code'
          : 'Verify your KeyVaultify account'

      const result = await resend.emails.send({
        from: 'ante.bucan.st@gmail.com',
        to: 'delivered@resend.dev',
        subject,
        html: emailHtml,
        text: `Your KeyVaultify verification code is: ${otp}. This code will expire in 10 minutes.`
      })
      console.log(result)

      console.log(`OTP email sent to ${email}:`, result.data?.id)
      return result
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      throw new Error('Failed to send verification code. Please try again.')
    }
  }
}

export const sendOTPEmail = EmailService.sendOTP
