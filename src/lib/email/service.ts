// src/lib/email/service.ts
import React from 'react'
import { render } from '@react-email/render'

import OTPEmail from './templates/OTPEmail'
import TeamInvitationEmail from './templates/TeamInvEmail'
import { emailConfig, resend } from './resend'

export class EmailService {
  static async sendOTP(params: {
    email: string
    otp: string
    type: 'sign-in' | 'email-verification' | 'forget-password'
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
        from: emailConfig.from,
        to: email,
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

  static async sendInvitation(params: {
    email: string
    teamName: string
    acceptUrl: string
    inviterName?: string
  }) {
    const { email, teamName, acceptUrl, inviterName } = params

    try {
      const emailHtml = await render(
        React.createElement(TeamInvitationEmail, {
          teamName,
          acceptUrl,
          inviterName
        })
      )

      const subject = `You’re invited to join ${teamName} on KeyVaultify`

      const result = await resend.emails.send({
        from: emailConfig.from,
        to: email,
        subject,
        html: emailHtml,
        text:
          `${inviterName ?? 'Someone'} invited you to join the team ${teamName}.\n\n` +
          `Accept the invitation: ${acceptUrl}\n\n` +
          `If you didn’t expect this invitation, please ignore this message.`
      })

      console.log(result)
      return result
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw new Error('Failed to send invitation. Please try again.')
    }
  }
}

export const sendOTPEmail = EmailService.sendOTP
export const sendInvitationEmail = EmailService.sendInvitation
