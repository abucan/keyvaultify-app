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
import { sendInvitationEmail, sendOTPEmail } from '@/lib/email/service'
import { db } from '@/lib/sqlite-db'

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
          const session = await auth.api.getSession({ headers: _headers })
          if (!session)
            throw new APIError('UNAUTHORIZED', { message: 'Sign in.' })

          const orgs = await auth.api.listOrganizations({ headers: _headers })

          const personal = orgs.find(
            (o: any) => o?.metadata?.isPersonal === true
          )
          if (!personal) {
            throw new APIError('FORBIDDEN', {
              message: 'Personal workspace not found.'
            })
          }

          const others = orgs.filter((o: any) => o.id !== personal.id)

          if (others.length === 0) {
            await auth.api.deleteOrganization({
              headers: _headers,
              body: { organizationId: personal.id }
            })

            return
          }

          const results = await Promise.allSettled(
            others.map(async (o: any) => {
              const full = await auth.api.getFullOrganization({
                headers: _headers,
                query: { organizationId: o.id }
              })
              const owners = (full?.members ?? []).filter(
                (m: any) => m.role === 'owner'
              )
              const onlyOwner =
                owners.length === 1 && owners[0]?.userId === session.user.id
              if (onlyOwner) {
                throw new APIError('FORBIDDEN', {
                  message:
                    'Transfer ownership in other organizations before deleting your account.'
                })
              }
            })
          )

          const failed = results.filter((r: any) => r.status === 'rejected')
          if (failed.length > 0) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'Failed to retrieve organizations.'
            })
          }

          await auth.api.deleteOrganization({
            headers: _headers,
            body: { organizationId: personal.id }
          })
        } catch (error: any) {
          console.error('Error during pre-delete cleanup:', error)
          throw new APIError('INTERNAL_SERVER_ERROR', {
            message: String(error.message)
          })
        }
      },
      afterDelete: async ({}) => {
        try {
          ;(await cookies()).delete('better-auth.session_token')
        } catch (error: any) {
          console.error('Error during post-delete cleanup:', error)
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

          if (orgs?.length > 0) {
            await auth.api.setActiveOrganization({
              headers: _headers,
              body: { organizationId: orgs[0].id }
            })
          }
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
