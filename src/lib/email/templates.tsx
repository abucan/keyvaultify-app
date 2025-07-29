import * as React from 'react'

interface EmailLayoutProps {
  children: React.ReactNode
  title: string
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ children, title }) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>{title}</title>
    </head>
    <body
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
        backgroundColor: '#f6f9fc',
        margin: 0,
        padding: 0
      }}
    >
      <table
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
        style={{
          width: '100%',
          backgroundColor: '#f6f9fc',
          padding: '20px 0'
        }}
      >
        <tr>
          <td align="center">
            <table
              role="presentation"
              cellSpacing="0"
              cellPadding="0"
              border={0}
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <tr>
                <td
                  style={{
                    padding: '40px 40px 20px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e1e8ed'
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    🔐 KeyVaultify
                  </div>
                </td>
              </tr>

              {/* Content */}
              <tr>
                <td style={{ padding: '40px' }}>{children}</td>
              </tr>

              {/* Footer */}
              <tr>
                <td
                  style={{
                    padding: '20px 40px 40px',
                    textAlign: 'center',
                    borderTop: '1px solid #e1e8ed',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                >
                  <p style={{ margin: '0 0 10px' }}>
                    This email was sent by KeyVaultify
                  </p>
                  <p style={{ margin: 0 }}>
                    If you didn&apos;t request this email, please ignore it.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
)

interface OTPEmailProps {
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
  email: string
}

export const OTPEmail: React.FC<OTPEmailProps> = ({ otp, type, email }) => (
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
