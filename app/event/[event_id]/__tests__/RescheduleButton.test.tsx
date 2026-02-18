import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RescheduleButton from '../RescheduleButton'

describe('RescheduleButton', () => {
  it('renders a link to the reschedule URL', () => {
    render(<RescheduleButton rescheduleUrl="/book/massage?rescheduleEventId=123" />)

    const link = screen.getByRole('link', { name: 'Reschedule' })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/book/massage?rescheduleEventId=123')
  })
})
