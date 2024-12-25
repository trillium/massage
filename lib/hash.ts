import { createHash } from "crypto"
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
export function getHash(
  data: string,
  key: string = process.env.GOOGLE_OAUTH_SECRET ?? ""
): string {
  return createHash("sha256")
    .update(data + key)
    .digest("hex")
}
