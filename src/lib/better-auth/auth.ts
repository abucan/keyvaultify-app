// src/lib/better-auth/auth.ts
// TODO: consider adding server-only import
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, organization } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

import { organization as Organization } from '@/db/schemas/auth-schema'
import { db } from '@/lib/sqlite-db'

import { sendInvitationEmail, sendOTPEmail } from '../email/service'

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
          redirect('/signin')
        } catch (error) {
          console.error('Error during post-delete cleanup:', error)
          redirect('/signin') // Fallback redirect
        }
      }
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const slug = `u-${session.userId}`
          const org = await db.query.organization.findFirst({
            where: eq(Organization.slug, slug),
            columns: { id: true }
          })

          return {
            data: {
              ...session,
              activeOrganizationId: org?.id ?? null
            }
          }
        }
      }
    },
    user: {
      create: {
        after: async user => {
          const slug = `u-${user.id}`

          const slugExists = await auth.api.checkOrganizationSlug({
            body: {
              slug
            }
          })

          if (slugExists) {
            // TODO: slug already exists, create another one
          }

          await auth.api.createOrganization({
            body: {
              name: user?.name
                ? `${user.name}'s Workspace`
                : 'Personal Workspace',
              slug,
              userId: user.id,
              metadata: {
                isPersonal: true
              }
            }
          })
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
      async sendVerificationOTP({ email, otp }) {
        await sendOTPEmail({
          email,
          type: 'sign-in',
          otp
        })
      }
    }),
    organization({
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        await sendInvitationEmail({
          email: invitation?.email,
          teamName: organization?.name,
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${invitation.id}`,
          inviterName: inviter?.user?.name || inviter?.user?.email
        })
      }
    })
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
