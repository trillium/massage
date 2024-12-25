import { decode, encode } from "@/lib/hashServer"
import type { HashableObject } from "@/lib/hashServer"

describe("encode and decode objects should match", () => {
  it("should encode, decode, and compare hashes correctly", async () => {
    const originalObject: HashableObject = { key1: "value1", key2: "value2" }
    const encodedObject = await encode(originalObject)
    const validationResult = await decode(encodedObject)

    expect(encodedObject).toHaveProperty("key")
    expect(encodedObject).toHaveProperty("data")
    expect(validationResult).toHaveProperty("validated")
    expect(validationResult).toHaveProperty("data")
    expect(validationResult).toHaveProperty("key")
    expect(validationResult.key === encodedObject.key)
    expect(validationResult.data).toEqual(encodedObject.data)
  })
})
