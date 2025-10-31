import { describe, it, expect } from 'vitest'
import adminAppointmentDescription from '../adminAppointmentDescription'
import { AppointmentProps } from '@/lib/types'

describe('adminAppointmentDescription', () => {
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

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
  })

  it('should include eventMemberString when provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      eventMemberString: '__MEMBER__',
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
    expect(description).toContain('__MEMBER__')
  })

  it('should include eventContainerString when provided', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      eventContainerString: '__CONTAINER__',
    }

    const description = await adminAppointmentDescription(props)

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

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
    expect(description).toContain('__MEMBER__')
    expect(description).toContain('__CONTAINER__')
  })

  it('should include Soothe-specific data from promo field', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: JSON.stringify({
        platform: 'Soothe',
        payout: '100',
        tip: '20',
        notes: 'Test notes',
      }),
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('$100')
    expect(description).toContain('$20')
    expect(description).toContain('$120.00')
    expect(description).toContain('Test notes')
    expect(description).toContain('__EVENT__')
  })

  it('should handle couples massage flag', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: JSON.stringify({
        platform: 'Soothe',
        isCouples: true,
      }),
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('Couples Massage')
    expect(description).toContain('__EVENT__')
  })

  it('should handle extra services', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: JSON.stringify({
        platform: 'Soothe',
        extraServices: ['Hot stones', 'Aromatherapy'],
      }),
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('Hot stones')
    expect(description).toContain('Aromatherapy')
    expect(description).toContain('__EVENT__')
  })

  it('should work without event strings', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      promo: JSON.stringify({
        platform: 'Soothe',
        payout: '100',
      }),
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('$100')
    expect(description).not.toContain('__EVENT__')
  })

  it('should handle invalid JSON in promo field', async () => {
    const props: AppointmentProps = {
      ...baseAppointmentProps,
      eventBaseString: '__EVENT__',
      promo: 'invalid json',
    }

    const description = await adminAppointmentDescription(props)

    expect(description).toContain('__EVENT__')
  })
})
