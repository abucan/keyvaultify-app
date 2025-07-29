import { createAuthClient } from 'better-auth/client'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()]
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
