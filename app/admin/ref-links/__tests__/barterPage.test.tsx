import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BarterLinksPage from '@/app/admin/ref-links/barter/page'
import { decodeRef } from '@/lib/ref/refCodec'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const SECRET = 'unit-secret'

function localStorageStub() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  }
}

describe('BarterLinksPage', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_REF_CODE_SECRET', SECRET)
    Object.defineProperty(window, 'localStorage', {
      value: localStorageStub(),
      configurable: true,
    })
  })

  function mint(show: string, client: string) {
    fireEvent.change(screen.getByLabelText(/show \/ event/i), { target: { value: show } })
    fireEvent.change(screen.getByLabelText(/client/i), { target: { value: client } })
    fireEvent.click(screen.getByRole('button', { name: /mint link/i }))
  }

  it('mints a /barter link whose ref code decodes to b-<show>-<client>', () => {
    render(<BarterLinksPage />)
    mint('SCaLE 23x', 'DJ Beard')

    const shown = screen.getByText(/\/barter\?ref=/).textContent as string
    const url = new URL(shown)
    expect(url.pathname).toBe('/barter')
    expect(decodeRef(url.searchParams.get('ref') as string, SECRET)).toBe('b-scale23x-dj-beard')
  })

  it('offers a text-it button that opens the sms composer with the link prefilled', () => {
    render(<BarterLinksPage />)
    mint('overtime', 'anna')

    const textIt = screen.getByRole('link', { name: /text it/i })
    const href = textIt.getAttribute('href') as string
    expect(href.startsWith('sms:?&body=')).toBe(true)
    expect(decodeURIComponent(href)).toContain('/barter?ref=')
  })

  it('remembers the show for the next mint', () => {
    render(<BarterLinksPage />)
    mint('overtime', 'anna')
    expect(window.localStorage.getItem('barter-show')).toBe('overtime')
  })

  it('shows an error instead of a link when the client label is missing', () => {
    render(<BarterLinksPage />)
    mint('overtime', '  ')
    expect(screen.getByText(/client is required/i)).toBeTruthy()
    expect(screen.queryByText(/\/barter\?ref=/)).toBeNull()
  })

  it('shows the missing-secret message when the secret is not configured', () => {
    vi.stubEnv('NEXT_PUBLIC_REF_CODE_SECRET', '')
    render(<BarterLinksPage />)
    mint('overtime', 'anna')
    expect(
      screen.getByText(/NEXT_PUBLIC_REF_CODE_SECRET is not set — cannot mint codes/i)
    ).toBeTruthy()
    expect(screen.queryByText(/\/barter\?ref=/)).toBeNull()
  })
})
