import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import type { ImgHTMLAttributes } from 'react'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import { AboutLayout } from './landingPage/AboutSection'
import BookingPreview from './BookingPreview'
import CopyableCode from './CopyableCode'

function RoundedImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { className = '', alt = '', ...rest } = props
  return (
    // biome-ignore lint/performance/noImgElement: mapping native markdown <img> — dimensions unknown at author time
    <img {...rest} alt={alt} className={`rounded-2xl ${className}`.trim()} />
  )
}

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  img: RoundedImg,
  BlogNewsletterForm,
  AboutLayout,
  BookingPreview,
  CopyableCode,
}
