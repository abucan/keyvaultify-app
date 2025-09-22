// src/lib/email/templates/TeamInvEmail.tsx
import EmailLayout from '@/lib/email/templates/EmailLayout'

type TeamInvitationEmailProps = {
  inviterName?: string
  teamName: string
  acceptUrl: string
}

export default function TeamInvitationEmail({
  inviterName,
  teamName,
  acceptUrl
}: TeamInvitationEmailProps) {
  return (
    <EmailLayout title={`You’re invited to join ${teamName} on KeyVaultify`}>
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
          Join {teamName} on KeyVaultify
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: '0 0 24px',
            textAlign: 'center',
            lineHeight: '24px'
          }}
        >
          {inviterName
            ? `${inviterName} has invited you to join the team ${teamName}.`
            : `You’ve been invited to join the team ${teamName}.`}
        </p>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a
            href={acceptUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Accept invitation
          </a>
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
          If you didn’t expect this invitation, please ignore this email.
        </p>
      </div>
    </EmailLayout>
  )
}

TeamInvitationEmail.PreviewProps = {
  inviterName: 'John Doe',
  teamName: 'Personal Workspace',
  acceptUrl: 'https://keyvaultify.app'
}
