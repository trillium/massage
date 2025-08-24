import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Mastodon,
  Threads,
  Instagram,
  Medium,
  Bluesky,
} from './icons'
import clsx from 'clsx'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
}

type SocialIconProps = {
  kind: keyof typeof components
  href: string | undefined
  size?: number
}

const sizeClasses = {
  0: 'h-0 w-0',
  0.5: 'h-0.5 w-0.5',
  1: 'h-1 w-1',
  1.5: 'h-1.5 w-1.5',
  2: 'h-2 w-2',
  2.5: 'h-2.5 w-2.5',
  3: 'h-3 w-3',
  3.5: 'h-3.5 w-3.5',
  4: 'h-4 w-4',
  5: 'h-5 w-5',
  6: 'h-6 w-6',
  7: 'h-7 w-7',
  8: 'h-8 w-8',
  9: 'h-9 w-9',
  10: 'h-10 w-10',
  11: 'h-11 w-11',
  12: 'h-12 w-12',
  14: 'h-14 w-14',
  16: 'h-16 w-16',
  20: 'h-20 w-20',
  24: 'h-24 w-24',
  28: 'h-28 w-28',
  32: 'h-32 w-32',
  36: 'h-36 w-36',
  40: 'h-40 w-40',
  44: 'h-44 w-44',
  48: 'h-48 w-48',
  52: 'h-52 w-52',
  56: 'h-56 w-56',
  60: 'h-60 w-60',
  64: 'h-64 w-64',
  72: 'h-72 w-72',
  80: 'h-80 w-80',
  96: 'h-96 w-96',
}

const SocialIcon = ({ kind, href, size = 8 }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null

  const SocialSvg = components[kind]

  return (
    <a className="text-sm transition" target="_blank" rel="noopener noreferrer" href={href}>
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={clsx(
          'hover:text-primary-500 dark:hover:text-primary-400 fill-current text-gray-400 dark:text-gray-200',
          sizeClasses[size]
        )}
      />
    </a>
  )
}

export default SocialIcon
