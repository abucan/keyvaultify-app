// src/lib/crypto/encryption.ts
import 'server-only'

import crypto from 'crypto'

// Algorithm for encryption
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32

/**
 * Derives a per-organization encryption key from the master key
 * @param orgId The organization ID to derive a key for
 * @returns Buffer containing the derived key
 */
function deriveOrgKey(orgId: string): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY

  if (!masterKey) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY environment variable is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }

  // Use PBKDF2 to derive a per-org key from the master key
  const salt = crypto.createHash('sha256').update(orgId).digest()

  return crypto.pbkdf2Sync(
    Buffer.from(masterKey, 'hex'),
    salt,
    100000, // iterations
    KEY_LENGTH,
    'sha256'
  )
}

/**
 * Encrypts a secret value using AES-256-GCM
 * @param plaintext The secret value to encrypt
 * @param orgId The organization ID (used to derive encryption key)
 * @returns Encrypted value as base64 string (format: iv:authTag:ciphertext)
 */
export function encryptSecret(plaintext: string, orgId: string): string {
  try {
    // Derive the encryption key for this organization
    const key = deriveOrgKey(orgId)

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // Encrypt the data
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    // Get the authentication tag
    const authTag = cipher.getAuthTag()

    // Combine IV, auth tag, and ciphertext (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt secret')
  }
}

/**
 * Decrypts a secret value that was encrypted with encryptSecret
 * @param encryptedValue The encrypted value (format: iv:authTag:ciphertext)
 * @param orgId The organization ID (used to derive encryption key)
 * @returns Decrypted plaintext value
 */
export function decryptSecret(encryptedValue: string, orgId: string): string {
  try {
    // Parse the encrypted value
    const parts = encryptedValue.split(':')

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format')
    }

    const [ivBase64, authTagBase64, ciphertext] = parts

    // Convert from base64
    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')

    // Derive the encryption key for this organization
    const key = deriveOrgKey(orgId)

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // Decrypt the data
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8')
    plaintext += decipher.final('utf8')

    return plaintext
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt secret')
  }
}

/**
 * Checks if the encryption is properly configured
 * @returns true if encryption is configured, false otherwise
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_MASTER_KEY
}
