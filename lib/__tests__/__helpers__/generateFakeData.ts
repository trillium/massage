import { OnSiteRequestType } from '@/lib/types'
import { faker } from '@faker-js/faker'
import { paymentMethod } from '@/data/paymentMethods'

export function generateFakeOnSiteRequest() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    start: faker.date.future().toISOString(),
    end: faker.date.future().toISOString(),
    timeZone: faker.location.timeZone(),
    location: faker.location.city(),
    duration: faker.number.int(2).toString(),
    price: faker.number.int(3).toString(),
    phone: faker.phone.number(),
    paymentMethod: faker.helpers.arrayElement(paymentMethod.map((m) => m.value)),
    eventBaseString: faker.lorem.word(),
    eventMemberString: faker.lorem.word(),
    eventContainerString: faker.lorem.word(),
    allowedDurations: [30, 60, 90],
    eventName: faker.lorem.words(3),
    sessionDuration: faker.number.int(2).toString(),
    pricing: {
      [faker.lorem.word()]: faker.number.int(),
    },
    paymentOptions: faker.lorem.word(),
    leadTime: faker.number.int({ min: 1, max: 10 }),
  }
}

describe('loadData', () => {
  it('should ignore this file', () => {
    expect(0).toEqual(0)
  })
})
