// src/lib/better-auth/auth.ts
import 'server-only'

import { cookies, headers } from 'next/headers'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { emailOTP, organization } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

import { organization as Organization } from '@/db/schemas/auth-schema'
import { db } from '@/lib/sqlite-db'

import { sendInvitationEmail, sendOTPEmail } from '../email/service'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async () => {
        try {
          const _headers = await headers()
          const rows = await auth.api.listOrganizations({
            headers: _headers
          })

          if (rows.length !== 1) {
            throw new APIError('FORBIDDEN', {
              message:
                'Ensure you’re the sole owner of a single organization before deleting your account.'
            })
          }
        } catch (error: any) {
          console.error('Error during pre-delete cleanup:', error)
          throw new APIError('INTERNAL_SERVER_ERROR', {
            message: String(error.message)
          })
        }
      },
      afterDelete: async ({}) => {
        try {
          const _headers = await headers()
          const rows = await auth.api.listOrganizations({
            headers: _headers
          })

          if (rows.length !== 1) {
            throw new APIError('FORBIDDEN', {
              message:
                'Ensure you’re the sole owner of a single organization before deleting your account.'
            })
          }
          await auth.api.deleteOrganization({
            headers: _headers,
            body: {
              organizationId: rows[0].id
            }
          })
          ;(await cookies()).delete('better-auth.session_token')
        } catch (error: any) {
          throw new APIError('INTERNAL_SERVER_ERROR', {
            message: String(error.message)
          })
        }
      }
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const slug = `pw-${session.userId}`
          const org = await db.query.organization.findFirst({
            where: eq(Organization.slug, slug),
            columns: { id: true, slug: true }
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
          const slug = `pw-${user.id}`

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
              name: 'Personal Workspace',
              slug,
              userId: user.id,
              metadata: {
                isPersonal: true,
                default_role: 'member'
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
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp }) {
        // TODO: Enable this later
        /*      
           await sendOTPEmail({
          email,
          type: 'sign-in',
          otp
        })
        */
      }
    }),
    organization({
      organizationDeletion: {
        afterDelete: async () => {
          const _headers = await headers()
          const orgs = await auth.api.listOrganizations({
            headers: _headers,
            query: {
              metadata: {
                isPersonal: true
              }
            }
          })

          await auth.api.setActiveOrganization({
            headers: _headers,
            body: { organizationId: orgs[0].id }
          })
        }
      },
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        /* await sendInvitationEmail({
          email: invitation?.email,
          teamName: organization?.name,
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitation.id}`,
          inviterName: inviter?.user?.name || inviter?.user?.email
        })
        */
      }
    }),
    nextCookies()
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
