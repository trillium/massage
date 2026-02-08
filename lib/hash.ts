import { createHash, createHmac } from 'crypto'
/**
 * Generates a hash for the given data.
 *
 * This function takes a data string and generates a hash using the
 * SHA-256 algorithm. The hash is created by combining the input data
 * with the value of the GOOGLE_OAUTH_SECRET environment variable.
 *
 * @function
 * @param {string} data - The input data string for which to generate the hash.
 * @returns {string} The resulting hash as a hexadecimal string.
 */
export function getHash(data: string, key: string = process.env.GOOGLE_OAUTH_SECRET!): string {
  if (!key) {
    throw new Error('GOOGLE_OAUTH_SECRET environment variable is required for hashing')
  }
  return createHash('sha256')
    .update(data + key)
    .digest('hex')
}

/**
 * Generates an HMAC for the given data using the provided key.
 *
 * This function takes a data string and generates an HMAC using the
 * SHA-256 algorithm with the provided key.
 *
 * @function
 * @param {string} data - The input data string for which to generate the HMAC.
 * @param {string} key - The key to use for HMAC.
 * @returns {string} The resulting HMAC as a hexadecimal string.
 */
export function hashHmac(data: string, key: string): string {
  return createHmac('sha256', key).update(data).digest('hex')
}
