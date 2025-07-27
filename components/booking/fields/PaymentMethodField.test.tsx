import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PaymentMethodField from './PaymentMethodField'
import { paymentMethod } from 'data/paymentMethods'
import { PaymentMethodType } from 'lib/types'

describe('PaymentMethodField', () => {
  it('renders all payment method radio buttons and labels', () => {
    render(<PaymentMethodField selected={undefined} onChange={() => {}} />)
    paymentMethod.forEach((method) => {
      // Check radio button
      const radio = screen.getByLabelText(method.name) as HTMLInputElement
      expect(radio).toBeInTheDocument()
      expect(radio.type).toBe('radio')
      // Check label
      expect(screen.getByText(method.name)).toBeInTheDocument()
    })
  })

  it('calls onChange when a radio button is clicked', () => {
    const handleChange = vi.fn()
    render(<PaymentMethodField selected={undefined} onChange={handleChange} />)
    const radio = screen.getByLabelText(paymentMethod[0].name)
    fireEvent.click(radio)
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows the correct hint for the selected payment method', () => {
    const selected: PaymentMethodType = paymentMethod[0].value
    render(<PaymentMethodField selected={selected} onChange={() => {}} />)
    expect(screen.getByText(`* ${paymentMethod[0].hint}`)).toBeInTheDocument()
  })
})
