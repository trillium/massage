import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocationField from './LocationField'
import React from 'react'
import { LocationObject } from 'lib/types'

describe('LocationField', () => {
  it('renders the zip code input', () => {
    const mockLocation: LocationObject = {
      street: '123 Main St',
      city: 'Los Angeles',
      zip: '90210',
    }

    render(<LocationField location={mockLocation} readOnly={false} onChange={() => {}} />)

    const zipInput = screen.getByLabelText(/zip code/i)
    expect(zipInput).toBeInTheDocument()
    expect(zipInput).toHaveAttribute('name', 'zipCode')
    expect(zipInput).toHaveValue('90210')
  })

  it('renders the zip code input as required', () => {
    const mockLocation: LocationObject = {
      street: '123 Main St',
      city: 'Los Angeles',
      zip: '90210',
    }

    render(<LocationField location={mockLocation} readOnly={false} onChange={() => {}} />)

    const zipInput = screen.getByLabelText(/zip code/i)
    expect(zipInput).toBeInTheDocument()
    expect(zipInput).toHaveAttribute('name', 'zipCode')
    expect(zipInput).toHaveValue('90210')
    expect(zipInput).toBeRequired()
  })

  it('renders the city input', () => {
    const mockLocation: LocationObject = {
      street: '123 Main St',
      city: 'Los Angeles',
      zip: '90210',
    }

    render(<LocationField location={mockLocation} readOnly={false} onChange={() => {}} />)

    const cityInput = screen.getByLabelText(/city/i)
    expect(cityInput).toBeInTheDocument()
    expect(cityInput).toHaveAttribute('name', 'city')
    expect(cityInput).toHaveValue('Los Angeles')
  })
})
