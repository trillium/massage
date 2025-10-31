import { describe, it, expect } from 'vitest'
import manualAdminAppointmentDescription from '../manualAdminAppointmentDescription'
import { AppointmentProps } from '@/lib/types'

describe('manualAdminAppointmentDescription', () => {
  const baseAppointmentProps: AppointmentProps = {
    start: '2024-01-01T10:00:00Z',
    end: '2024-01-01T11:00:00Z',
    summary: 'Test Appointment',
    email: 'test@example.com',
    phone: '555-5555',
    location: '123 Main St',
    timeZone: 'America/Los_Angeles',
    requestId: 'test-123',
    firstName: 'John',
    lastName: 'Doe',
    duration: '60',
  }

  it('should include __EVENT__ placeholder when eventBaseString is provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
  })

  it('should include eventMemberString when provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      eventMemberString: '__MEMBER__',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
    expect(description).toContain('__MEMBER__')
  })

  it('should include eventContainerString when provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      eventContainerString: '__CONTAINER__',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
    expect(description).toContain('__CONTAINER__')
  })

  it('should include all event strings when provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      eventMemberString: '__MEMBER__',
      eventContainerString: '__CONTAINER__',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
    expect(description).toContain('__MEMBER__')
    expect(description).toContain('__CONTAINER__')
  })

  it('should include manual entry data from promo field', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: JSON.stringify({
        platform: 'ManualEntry',
        payout: '150',
        tip: '30',
        notes: 'Client prefers deep tissue',
      }),
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('$150')
    expect(description).toContain('$30')
    expect(description).toContain('$180.00')
    expect(description).toContain('Client prefers deep tissue')
    expect(description).toContain('__EVENT__')
  })

  it('should handle couples massage flag', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: JSON.stringify({
        platform: 'ManualEntry',
        isCouples: true,
      }),
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('Couples Massage')
    expect(description).toContain('__EVENT__')
  })

  it('should work without event strings', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      promo: JSON.stringify({
        platform: 'ManualEntry',
        payout: '100',
      }),
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('$100')
    expect(description).not.toContain('__EVENT__')
  })

  it('should handle invalid JSON in promo field', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: 'invalid json',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
  })

  it('should handle empty promo field', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
    }

    const description = await manualAdminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
  })
})
