import clsx from 'clsx'
import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Logo from '@/components/Logo'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaRegCalendarAlt } from 'react-icons/fa'
import { servicesLinks } from '@/data/servicesData'
import { createContactUrl } from '@/lib/helpers'

export default function Footer() {
  return (
    <footer className="bg-gray-900 p-4">
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
  const quickLinks = [
    { text: 'Services', href: '/services' },
    { text: 'About Us', href: '/about' },
    { text: 'Testimonials', href: '/reviews' },
    { text: 'Pricing', href: '/pricing' },
    { text: 'Contact', href: '/contact' },
    { text: 'Frequently Ask Questions', href: '/faq' },
  ]
  return (
    <div className={clsx(displayClasses, 'flex flex-col items-start')}>
      <h2 className="mb-6 text-base font-bold text-white">Quick Links</h2>
      <ul className="xs:mb-8 mb-0 space-y-3">
        {quickLinks.map((item) => (
          <ListItem positionClasses="pl-4" key={item.text} {...item} />
        ))}
      </ul>
    </div>
  )
}

function ListItem({ text, href, positionClasses }) {
  return (
    <li>
      <Link
        href={href}
        className={clsx(positionClasses, 'text-gray-400 transition-colors hover:text-white')}
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
      <h2 className="mb-6 text-base font-bold text-white">Services</h2>
      <h2 className="mb-2 ml-4 text-base font-bold text-white">In-Home Massage Services</h2>
      <ul className="mb-8 space-y-1">
        {tableServiceLinks.map((item) => (
          <ListItem positionClasses="pl-8" key={item.text} {...item} />
        ))}
      </ul>
      <h2 className="mb-2 ml-4 text-base font-bold text-white">In-Office/Event Massage Services</h2>
      <ul className="mb-8 space-y-1">
        {eventServiceLinks.map((item) => (
          <ListItem positionClasses="pl-8" key={item.text} {...item} />
        ))}
      </ul>
    </div>
  )
}

function Socials() {
  return (
    <div className="mt-8 flex flex-col items-start">
      <div className="mb-3 flex space-x-4 text-red-400">
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
      </div>
    </div>
  )
}

function CopyrightNotice() {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="mb-2 flex flex-row flex-wrap items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="whitespace-nowrap">{siteMetadata.author}</div>
        <div>{` • `}</div>
        <div className="whitespace-nowrap">{`© ${new Date().getFullYear()}`}</div>
        <Link className="whitespace-nowrap" href="/">
          <span>{` • `}</span>
          {siteMetadata.title}
        </Link>
      </div>
      <div className="mb-8 text-sm text-gray-500 dark:text-gray-400"></div>
    </div>
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
          <div className="mr-3">
            <Logo forceTheme="light" classes="text-primary-500 w-8 h-8 xs:w-10 xs:h-10" />
          </div>

          <div
            className={clsx(
              'border-primary-500 border-b-2 text-2xl leading-6 font-semibold whitespace-nowrap sm:text-xl xl:border-b-3'
            )}
          >
            {siteMetadata.headerTitle}
          </div>
        </div>
      </Link>
      <p className="text-gray-400">
        Providing professional massage therapy services to help you relax, rejuvenate, and restore
        your body and mind.
      </p>
      <Socials />
    </div>
  )
}

function ContactItem({ icon, children, iconClass = '' }) {
  return (
    <li className="flex items-start gap-3 pl-4">
      <span className={clsx('mt-1 text-lg text-teal-400', iconClass)}>{icon}</span>
      <span className="text-base text-gray-400">{children}</span>
    </li>
  )
}

function ContactFooterSection({ displayClasses }: { displayClasses: string }) {
  return (
    <div className={clsx(displayClasses)}>
      <h2 className="mb-6 font-bold text-white">Contact Us</h2>
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
        <span className="block whitespace-nowrap">Westchester Area by LAX,</span>{' '}
        <span className="block whitespace-nowrap">Los Angeles</span>
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
          <span className="block">Availabile by phone</span>{' '}
          <span className="block">Request a call</span>
        </div>
      </Link>
    ),
  },
  {
    icon: <FaRegCalendarAlt />,
    content: 'Open 7 Days a Week',
  },
  {
    icon: <FaClock />,
    content: 'By Appointment Daily',
  },
]
