"use server"

import { getHash } from "./hash"

export type HashableObject = {
  [key: string]: any
  hash?: string
}

type ValidationResult = {
  validated: boolean
  data: HashableObject
  key?: string
}

/**
 * Encodes an object by adding a hash property.
 *
 * @param {HashableObject} obj - The input object to encode.
 * @returns {HashableObject} The new object with an additional hash property.
 */
export async function encode(obj: HashableObject): Promise<HashableObject> {
  const dataString = JSON.stringify(obj)
  const hash = getHash(dataString)
  return { key: hash, data: obj }
}

/**
 * Decodes an object by validating its hash property.
 *
 * @param {HashableObject} obj - The input object with a hash property to validate.
 * @returns {boolean} True if the hash is valid, otherwise false.
 */
export async function decode(obj: HashableObject): Promise<ValidationResult> {
  if (!obj.key) {
    return { validated: false, data: obj }
  }
  
  const { key, data: dataWithoutHash } = obj
  const dataString = JSON.stringify(dataWithoutHash)
  const validHash = await getHash(dataString)
  return {
    validated: key === validHash,
    data: dataWithoutHash,
    key: validHash,
  }
}