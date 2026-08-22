import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Gallery from '../Gallery'

vi.mock('@/components/Image', () => ({
  default: ({
    src,
    alt,
    fill,
    className,
  }: {
    src: string
    alt: string
    fill?: boolean
    className?: string
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} className={className} />
  ),
}))

const images = [
  { src: '/img/a.jpg', alt: 'Image A' },
  { src: '/img/b.jpg', alt: 'Image B', caption: 'Caption B' },
]

describe('Gallery', () => {
  it('renders all images', () => {
    render(<Gallery images={images} />)
    expect(screen.getByAltText('Image A')).toBeInTheDocument()
    expect(screen.getByAltText('Image B')).toBeInTheDocument()
  })

  it('renders grid images full-width at natural aspect ratio', () => {
    render(<Gallery images={images} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBe(images.length)
    imgs.forEach((img) => {
      expect(img.className).toContain('h-auto')
      expect(img.className).toContain('w-full')
    })
  })

  it('button wrapper has h-auto to prevent default h-10 from clipping the card', () => {
    const { container } = render(<Gallery images={images} />)
    const buttons = container.querySelectorAll('button, [role="button"]')
    buttons.forEach((btn) => {
      expect(btn.className).toContain('h-auto')
      expect(btn.className).not.toMatch(/\bh-10\b/)
    })
  })

  it('opens the lightbox dialog when an image is clicked', () => {
    render(<Gallery images={images} />)
    fireEvent.click(screen.getByAltText('Image A'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
