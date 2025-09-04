// src/lib/email/templates/OTPEmail.tsx
import EmailLayout from './EmailLayout'

type OTPEmailProps = {
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
  email: string
}

export default function OTPEmail({ otp, type, email }: OTPEmailProps) {
  return (
    <EmailLayout
      title={`Your KeyVaultify ${type === 'sign-in' ? 'sign-in' : 'verification'} code`}
    >
      <div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: '0 0 16px',
            textAlign: 'center'
          }}
        >
          {type === 'sign-in'
            ? 'Sign in to KeyVaultify'
            : 'Welcome to KeyVaultify!'}
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: '0 0 32px',
            textAlign: 'center',
            lineHeight: '24px'
          }}
        >
          {type === 'sign-in'
            ? `Use this code to sign in to your account (${email}):`
            : `Use this code to verify your email address and create your account:`}
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            margin: '0 0 32px'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              letterSpacing: '8px',
              margin: 0
            }}
          >
            {otp}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '16px',
            margin: '0 0 24px'
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#92400e',
              margin: 0,
              fontWeight: '500'
            }}
          >
            ⚠️ This code will expire in 10 minutes
          </p>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            textAlign: 'center',
            lineHeight: '20px'
          }}
        >
          For security reasons, never share this code with anyone. KeyVaultify
          staff will never ask for your verification code.
        </p>
      </div>
    </EmailLayout>
  )
}

OTPEmail.PreviewProps = {
  otp: '123456',
  type: 'sign-in',
  email: 'ante.bucan.st@gmail.com'
}
