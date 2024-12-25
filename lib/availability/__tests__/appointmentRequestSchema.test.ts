import { AppointmentRequestSchema } from "@/lib/schema"

describe("AppointmentRequestSchema", () => {
  it("should validate a correct appointment request", async () => {
    const validData = {
      firstName: "Testy",
      lastName: "Tester",
      email: "testy@example.com",
      location: "123 Address Road, City, 00040",
      phone: "555-444-3333",
      paymentMethod: "cash",
      start: "2024-09-01T10:00:00-07:00",
      end: "2024-09-01T11:30:00-07:00",
      duration: "90",
      price: "210",
      timeZone: "America/Los_Angeles",
      eventBaseString: "__EVENT__"
    }

    const validationResult = AppointmentRequestSchema.safeParse(validData)
    await expect(validationResult.success).toBe(true)
  })

  it("should invalidate an appointment request with missing fields", async () => {
    const invalidData = {
      firstName: "Testy",
      lastName: "Tester",
      email: "testy@example.com",
      location: "123 Address Road, City, 00040",
      phone: "555-444-3333",
      paymentMethod: "cash",
      start: "2024-09-01T10:00:00-07:00",
      end: "2024-09-01T11:30:00-07:00",
      // duration: "90",
      // price: "210",
      timeZone: "America/Los_Angeles",
    }

    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })

  it("should invalidate an appointment request with incorrect email", async () => {
    const invalidData = {
      firstName: "Testy",
      lastName: "Tester",
      email: "testyexample.com",
      location: "123 Address Road, City, 00040",
      phone: "555-444-3333",
      paymentMethod: "cash",
      start: "2024-09-01T10:00:00-07:00",
      end: "2024-09-01T11:30:00-07:00",
      duration: "90",
      price: "210",
      timeZone: "America/Los_Angeles",
    }
    
    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })

  it("should invalidate an appointment request with incorrect payment method", async () => {
    const invalidData = {
      firstName: "Testy",
      lastName: "Tester",
      email: "testy@example.com",
      location: "123 Address Road, City, 00040",
      phone: "555-444-3333",
      start: "2024-09-01T10:00:00-07:00",
      end: "2024-09-01T11:30:00-07:00",
      duration: "90",
      price: "210",
      timeZone: "America/Los_Angeles",
      paymentMethod: "exposure", // this should fail
    }
    
    const validationResult = AppointmentRequestSchema.safeParse(invalidData)
    await expect(validationResult.success).toBe(false)
  })
})
