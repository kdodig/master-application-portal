import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const config = useRuntimeConfig()

// Get DATABASE_ENCRYPTION_KEY from .env
const keyHex = config.DATABASE_ENCRYPTION_KEY
if (!keyHex) {
  throw new Error('DATABASE_ENCRYPTION_KEY is not set in the environment variables.')
}

const key = Buffer.from(keyHex, 'hex')

export function encryptField(plainText: string): string {
  const iv = randomBytes(16) // Initialisierungsvektor
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptField(encryptedText: string): string {
  const [ivHex, dataHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(dataHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
