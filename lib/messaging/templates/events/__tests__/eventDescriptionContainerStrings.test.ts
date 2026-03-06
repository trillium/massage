import { describe, it, expect } from 'vitest'
import eventDescription from '../eventDescription'

describe('eventDescription includes container member strings', () => {
  const baseProps = {
    start: '2024-06-15T10:00:00Z',
    end: '2024-06-15T11:00:00Z',
    phone: '555-1234',
    duration: '60',
    email: 'client@test.com',
    location: '123 Main St',
    firstName: 'John',
    lastName: 'Doe',
  }

  it('includes eventMemberString in output when provided', () => {
    const result = eventDescription({
      ...baseProps,
      eventBaseString: 'scale23x__EVENT__',
      eventMemberString: 'scale23x__EVENT__MEMBER__',
    })

    expect(result).toContain('scale23x__EVENT__MEMBER__')
  })

  it('includes eventBaseString in output when provided', () => {
    const result = eventDescription({
      ...baseProps,
      eventBaseString: 'scale23x__EVENT__',
    })

    expect(result).toContain('scale23x__EVENT__')
  })

  it('does not include member string when eventMemberString is undefined', () => {
    const result = eventDescription({
      ...baseProps,
      eventBaseString: 'scale23x__EVENT__',
      eventMemberString: undefined,
    })

    expect(result).not.toContain('__EVENT__MEMBER__')
  })
})
