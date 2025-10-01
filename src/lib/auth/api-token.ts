// src/lib/auth/api-token.ts
import 'server-only'

import crypto from 'crypto'

const TOKEN_PREFIX = 'kvf_'
const TOKEN_LENGTH = 64 // 64 chars after prefix

/**
 * Generates a cryptographically secure API token
 * Format: kvf_<64 random chars>
 * @returns The generated token (plaintext)
 */
export function generateToken(): string {
  const randomBytes = crypto.randomBytes(TOKEN_LENGTH / 2) // /2 because hex encoding doubles length
  const randomString = randomBytes.toString('hex')
  return `${TOKEN_PREFIX}${randomString}`
}

/**
 * Gets the display prefix for a token (first 12 chars including prefix)
 * Example: "kvf_Ab3cD5fG..."
 * @param token The full token
 * @returns The prefix for display
 */
export function generateTokenPrefix(token: string): string {
  return token.substring(0, 12) + '...'
}

/**
 * Hashes a token for secure storage using SHA-256
 * We use SHA-256 instead of bcrypt for API tokens because:
 * - We need fast lookups during API calls
 * - Tokens are already high-entropy (64 random chars)
 * - Standard practice for API tokens (GitHub, Stripe, etc.)
 * @param token The plaintext token
 * @returns The hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Verifies if a token matches its hash
 * @param token The plaintext token to verify
 * @param hash The stored hash
 * @returns true if token matches hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token)
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash))
}

/**
 * Validates token format
 * @param token The token to validate
 * @returns true if token has correct format
 */
export function isValidTokenFormat(token: string): boolean {
  return (
    token.startsWith(TOKEN_PREFIX) &&
    token.length === TOKEN_PREFIX.length + TOKEN_LENGTH &&
    /^kvf_[a-f0-9]{64}$/.test(token)
  )
}
