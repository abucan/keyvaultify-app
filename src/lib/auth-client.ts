import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  plugins: [nextCookies()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;