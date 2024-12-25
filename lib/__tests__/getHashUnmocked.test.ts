import { getHash } from "@/lib/hash"

describe("getHash unmocked", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.unmock("crypto")
    process.env = { ...originalEnv }
  })

  it("should return different results when GOOGLE_OAUTH_SECRET is set and unset", () => {
    const originalSecret = process.env.GOOGLE_OAUTH_SECRET

    // Set the environment variable
    process.env.GOOGLE_OAUTH_SECRET = "test_secret"
    const resultWithSecret = getHash("data")

    // Unset the environment variable
    delete process.env.GOOGLE_OAUTH_SECRET
    const resultWithoutSecret = getHash("data")

    // Compare the results
    expect(resultWithSecret).not.toEqual(resultWithoutSecret)

    // Restore the original environment variable
    if (originalSecret !== undefined) {
      process.env.GOOGLE_OAUTH_SECRET = originalSecret
    } else {
      delete process.env.GOOGLE_OAUTH_SECRET
    }
  })
})
