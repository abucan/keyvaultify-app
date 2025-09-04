// src/lib/email/templates/EmailLayout.tsx
type EmailLayoutProps = {
  children: React.ReactNode
  title: string
}

export default function EmailLayout({ children, title }: EmailLayoutProps) {
  return (
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
}
