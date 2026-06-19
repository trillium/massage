import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

interface PeerRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

/**
 * A bare radio input for CSS peer patterns.
 *
 * Renders only the <input type="radio"> element — no wrapper div, no label,
 * no default styles. Use when sibling labels are driven by :peer-checked via
 * Tailwind's `peer` class (e.g. `className="peer sr-only"`).
 *
 * For a labeled radio with visible UI, use <Radio> instead.
 */
export function PeerRadio({ className, ...props }: PeerRadioProps) {
  return <input type="radio" className={cn(className)} {...props} />
}
