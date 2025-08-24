/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import clsx from 'clsx'

const CustomLink = ({
  href,
  classes,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { classes?: string }) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return <Link className={clsx('break-words', classes)} href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <Link className={clsx('break-words', classes)} href={href} {...rest} />
  }

  return (
    <a
      className={clsx('break-words', classes)}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      {...rest}
    />
  )
}

export default CustomLink
