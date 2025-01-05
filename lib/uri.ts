// /lib/URIMaker.ts

import { getHash } from './hash' // Assuming getHash is defined in hash.ts

type QueryParams = Record<string, string | number>

interface URIResult {
  isClient: boolean
  uri: string
}

/**
 * Generates a URI by replacing "admin" with "reviews/rate/" in the current window location
 * and appending the provided query parameters.
 *
 * @param {QueryParams} obj - An object representing the query parameters.
 * @returns {URIResult | undefined} The generated URI or undefined if window is not defined.
 */
export function createURI(obj: QueryParams): URIResult | undefined {
  const stringArray: string[][] = Object.entries(obj).map(([key, value]) => [key, value.toString()])

  const params = new URLSearchParams(stringArray).toString()

  if (typeof window !== 'undefined') {
    const uri = window.location.origin + '/reviews/rate/' + '?' + params
    return { isClient: true, uri: uri }
  }
  return { isClient: false, uri: params }
}
