import { createAuthClient } from 'better-auth/client'
import { emailOTPClient } from 'better-auth/client/plugins'
import { nextCookies } from 'better-auth/next-js'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()]
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
