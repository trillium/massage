import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LocationField from '../fields/LocationField'
import React from 'react'
import { LocationObject } from 'lib/types'

describe('LocationField', () => {
  it('renders both zip code and city fields', () => {
    const mockLocation: LocationObject = {
      street: '123 Main St',
      city: 'San Francisco',
      zip: '94110',
    }

    render(<LocationField location={mockLocation} readOnly={false} onChange={() => {}} />)

    // Check for the zip code input
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
    // Check for the city input
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    // Check for the location input
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
  })
})
