// src/lib/better-auth/auth-client.ts
import { createAuthClient } from 'better-auth/client'
import { emailOTPClient, organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), organizationClient()]
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  revokeSessions
} = authClient
