import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // GCM recommended
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY
  if (!raw) {
    throw new Error("INTEGRATIONS_ENCRYPTION_KEY env var is not set")
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error(
      "INTEGRATIONS_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded AES-256 key)"
    )
  }
  return key
}

/**
 * Encrypts a plaintext token string to a compact binary blob that
 * can be stored in a bytea column. Format: [IV || AUTH_TAG || CIPHERTEXT].
 */
export function encryptToken(plaintext: string): Buffer {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext])
}

/**
 * Decrypts a blob produced by encryptToken. Throws if the ciphertext
 * is malformed or the auth tag doesn't match.
 */
export function decryptToken(blob: Buffer): string {
  const key = getKey()
  if (blob.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Token ciphertext is too short to be valid")
  }
  const iv = blob.subarray(0, IV_LENGTH)
  const authTag = blob.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = blob.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}

/**
 * One-time helper for generating a new key. Call this from a local script or
 * use `openssl` to produce the value that goes in Vercel env. Do NOT call
 * from request handlers.
 *
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("base64")
}
