import { type ReactNode } from 'react'
import clsx from 'clsx'
import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Logo from '@/components/Logo'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaRegCalendarAlt } from 'react-icons/fa'
import { servicesLinks } from '@/data/servicesData'
import { createContactUrl } from '@/lib/helpers'
import { home, site } from '@/app/content'
import footer from '@/data/footer.json'
import { H2 } from '@/components/ui/heading'
import { TextBaseMuted, TextBase, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

export default function Footer() {
  return (
    <footer className="dark bg-surface-900 p-4">
      <div
        className={clsx(
          'items-start gap-8',
          //
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'
        )}
      >
        <LogoAndBlurb displayClasses="xs:col-span-1 col-span-1 flex flex-col gap-y-2" />
        <QuicklinkContainer displayClasses={''} />
        <ServiceIsContainer displayClasses={''} />
        <ContactFooterSection displayClasses={''} />
      </div>
      <CopyrightNotice />
    </footer>
  )
}

function QuicklinkContainer({ displayClasses }: { displayClasses?: string }) {
  return (
    <div className={clsx(displayClasses, 'flex flex-col items-start')}>
      <H2 className="mb-6">{footer.quickLinks.heading}</H2>
      <ul className="xs:mb-8 mb-0 space-y-3">
        {footer.quickLinks.links.map((item) => (
          <ListItem positionClasses="pl-4" key={item.text} {...item} />
        ))}
      </ul>
    </div>
  )
}

function ListItem({
  text,
  href,
  positionClasses,
}: {
  text: string
  href: string
  positionClasses?: string
}) {
  return (
    <li>
      <Link
        href={href}
        className={clsx(positionClasses, 'text-accent-400 transition-colors hover:text-white')}
      >
        {text}
      </Link>
    </li>
  )
}

function ServiceIsContainer({ displayClasses }: { displayClasses?: string }) {
  const { event: eventServiceLinks, table: tableServiceLinks } = servicesLinks

  return (
    <div className={clsx(displayClasses, 'flex flex-col items-start')}>
      <H2 className="mb-6">{footer.services.heading}</H2>
      <H2 className="mb-2 ml-4">{footer.services.inHome.heading}</H2>
      <ul className="mb-8 space-y-1">
        {tableServiceLinks.map((item) => (
          <ListItem positionClasses="pl-8 whitespace-nowrap" key={item.text} {...item} />
        ))}
      </ul>
      <H2 className="mb-2 ml-4">{footer.services.inOfficeEvent.heading}</H2>
      <ul className="mb-8 space-y-1">
        {eventServiceLinks.map((item) => (
          <ListItem positionClasses="pl-8 whitespace-nowrap" key={item.text} {...item} />
        ))}
      </ul>
    </div>
  )
}

function Socials() {
  return (
    <Stack className="mt-8" direction="col" align="start">
      <Stack className="mb-3 space-x-4 text-red-400" direction="row">
        <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
        <SocialIcon kind="github" href={siteMetadata.github} size={6} />
        <SocialIcon kind="facebook" href={siteMetadata.facebook} size={6} />
        <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
        <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
        <SocialIcon kind="twitter" href={siteMetadata.twitter} size={6} />
        <SocialIcon kind="bluesky" href={siteMetadata.bluesky} size={6} />
        <SocialIcon kind="x" href={siteMetadata.x} size={6} />
        <SocialIcon kind="instagram" href={siteMetadata.instagram} size={6} />
        <SocialIcon kind="threads" href={siteMetadata.threads} size={6} />
        <SocialIcon kind="medium" href={siteMetadata.medium} size={6} />
      </Stack>
    </Stack>
  )
}

function CopyrightNotice() {
  return (
    <Stack className="mt-8" direction="col" align="center">
      <Stack
        className="mb-2 space-x-2 text-sm text-accent-500 dark:text-accent-400"
        direction="row"
        wrap
        align="center"
        justify="center"
      >
        <div className="whitespace-nowrap">{siteMetadata.author}</div>
        <div>{` • `}</div>
        <div className="whitespace-nowrap">{`© ${new Date().getFullYear()}`}</div>
        <Link className="whitespace-nowrap" href="/">
          <TextBase as="span">{` • `}</TextBase>
          {siteMetadata.title}
        </Link>
      </Stack>
      <div className="mb-8 text-sm text-accent-500 dark:text-accent-400"></div>
    </Stack>
  )
}

function LogoAndBlurb({ displayClasses }: { displayClasses: string }) {
  return (
    <div className={clsx(displayClasses, 'text-white')}>
      <Link href="/" aria-label={siteMetadata.headerTitle} className="group">
        <div
          className={clsx(
            'group-focus-within: flex items-center',
            'group-focus-within:outline-primary-500 rounded-md outline-2 outline-offset-2 outline-transparent'
          )}
        >
          {site.branding.siteLogo && (
            <div className="mr-3">
              <Logo forceTheme="light" classes="text-primary-500 w-8 h-8 xs:w-10 xs:h-10" />
            </div>
          )}

          <div
            className={clsx(
              'border-primary-500 border-b-2 text-2xl leading-6 font-semibold whitespace-nowrap sm:text-xl xl:border-b-3'
            )}
          >
            {siteMetadata.headerTitle}
          </div>
        </div>
      </Link>
      <TextBase className="text-accent-400" data-content="footer.blurb">
        {home.footer.blurb}
      </TextBase>
      <Socials />
    </div>
  )
}

function ContactItem({
  icon,
  children,
  iconClass = '',
}: {
  icon: ReactNode
  children: ReactNode
  iconClass?: string
}) {
  return (
    <li className="flex items-start gap-3 pl-4">
      <TextLg as="span" className={clsx('mt-1 text-lg text-primary-400', iconClass)}>
        {icon}
      </TextLg>
      <TextBaseMuted as="div">{children}</TextBaseMuted>
    </li>
  )
}

function ContactFooterSection({ displayClasses }: { displayClasses: string }) {
  return (
    <div className={clsx(displayClasses)}>
      <H2 className="mb-6">{footer.contact.heading}</H2>
      <ul className="space-y-4">
        {contactItems.map((item, index) => (
          <ContactItem key={index} icon={item.icon}>
            {item.content}
          </ContactItem>
        ))}
      </ul>
    </div>
  )
}

const contactItems = [
  {
    icon: <FaMapMarkerAlt />,
    content: (
      <>
        <TextBase as="span" className="block whitespace-nowrap" data-content="footer.locationLine1">
          {home.footer.locationLine1}
        </TextBase>{' '}
        <TextBase as="span" className="block whitespace-nowrap" data-content="footer.locationLine2">
          {home.footer.locationLine2}
        </TextBase>
      </>
    ),
  },
  {
    icon: <FaPhoneAlt />,
    content: (
      <Link
        href={createContactUrl(`Informational Callback Request`)}
        classes="group outline-transparent"
      >
        <div className="group-focus-within:outline-primary-500 inline-block rounded-md outline-2 outline-offset-2 outline-transparent hover:text-white">
          <TextBase as="span" className="block">
            {footer.contact.phone.label}
          </TextBase>{' '}
          <TextBase as="span" className="block">
            {footer.contact.phone.cta}
          </TextBase>
        </div>
      </Link>
    ),
  },
  {
    icon: <FaRegCalendarAlt />,
    content: footer.contact.hours,
  },
  {
    icon: <FaClock />,
    content: footer.contact.appointment,
  },
]
