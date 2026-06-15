import clsx from 'clsx'
import Link from 'next/link'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'

interface TemplateProps {
  title: string
  text?: string | string[]
  links?: { label: string; href: string }[]
  classes?: string
  center?: boolean
}

export default function Template({ title, text, links, classes, center = false }: TemplateProps) {
  const renderText = () => {
    if (!text) return null
    if (typeof text === 'string') {
      return (
        <TextBase className="mt-2 mb-2 font-medium text-accent-800 sm:mt-6 sm:text-xl dark:text-accent-100">
          {text}
        </TextBase>
      )
    }
    if (Array.isArray(text)) {
      return text.map((paragraph, index) => (
        <TextBase
          key={index}
          className="mt-2 font-medium text-accent-800 last:mb-2 sm:mt-6 sm:text-xl dark:text-accent-100"
        >
          {paragraph}
        </TextBase>
      ))
    }
    return null
  }

  return (
    <div
      className={clsx('py-4', {
        'text-center': center,
      })}
    >
      <H1 className="sm:text-4xl md:text-5xl" status="primary">
        {title}
      </H1>
      {renderText()}
      {links?.map((link) => (
        <TextBase key={link.href} className="mt-2 font-medium sm:mt-4 sm:text-xl">
          <Link
            href={link.href}
            className="text-primary-500 dark:text-primary-400 underline hover:text-primary-600 dark:hover:text-primary-300"
          >
            {link.label}
          </Link>
        </TextBase>
      ))}
    </div>
  )
}
