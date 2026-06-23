import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('image container has aspect-[4/3] class to prevent thin-strip rendering', () => {
    const { container } = render(<Gallery images={images} />)
    const imageWrappers = container.querySelectorAll('.aspect-\\[4\\/3\\]')
    expect(imageWrappers.length).toBe(images.length)
  })

  it('button wrapper has h-auto to prevent default h-10 from clipping the card', () => {
    const { container } = render(<Gallery images={images} />)
    const buttons = container.querySelectorAll('button, [role="button"]')
    buttons.forEach((btn) => {
      expect(btn.className).toContain('h-auto')
      expect(btn.className).not.toMatch(/\bh-10\b/)
    })
  })

  it('images use fill mode with object-cover', () => {
    render(<Gallery images={images} />)
    const imgs = screen.getAllByRole('img')
    imgs.forEach((img) => {
      expect(img).toHaveAttribute('data-fill', 'true')
      expect(img.className).toContain('object-cover')
    })
  })
})
