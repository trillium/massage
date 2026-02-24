import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-07',
  repos: ['meet', 'www-massage'],
  commitCount: 190,
  highlights: [
    'Migrated the entire booking app from Next.js Pages Router to App Router',
    'Built a pricing system with booking slugs so each service type gets its own URL',
    'Created /about and /faq pages, a nav header, and a new brand identity with custom logo and color scheme',
    'Restructured email templates with clearer naming and richer session details',
  ],
  categories: [
    {
      label: 'App Router Migration',
      icon: 'bolt',
      items: [
        'Migrated all pages (index, booked, confirmation) from Pages Router to App Router with server/client component split',
        'Converted API routes (request, confirm) to App Router route handlers using NextRequest and NextResponse',
        'Replaced getServerSideProps with server-side data fetching in page components',
        'Rebuilt the root layout with metadata API, ThemeProviders client component, and body/html structure',
        'Switched to @-based import paths and created a shared fetch utility in /lib',
      ],
    },
    {
      label: 'Pricing & Booking',
      icon: 'calendar',
      items: [
        'Created a pricing config file with named booking slugs for each service tier',
        'Built dynamic [bookingSlug] routes so each service type has its own page',
        'Added PricingWrapper component and SET_PRICE action in the availability context',
        'Wired price through the booking form, request schema, and email templates',
      ],
    },
    {
      label: 'Email Templates',
      icon: 'bell',
      items: [
        'Renamed ConfirmationEmail to ClientRequestEmail to better reflect its purpose',
        'Created a shared EmailProps type used across approval and client request emails',
        'Updated subject lines and message bodies with session details and formatting',
      ],
    },
    {
      label: 'New Pages',
      icon: 'paint',
      items: [
        'Built /about page with an AboutCard component (originally AuthorCard, later renamed)',
        'Created /faq page with expandable question components',
        'Added a BookSessionButton component used across pages',
      ],
    },
    {
      label: 'Brand & Design',
      icon: 'images',
      items: [
        'Added a custom trillium-shaped SVG logo with dark/light mode support',
        'Swapped primary and secondary colors (green to teal, teal to green)',
        'Replaced favicon with the new logo across all icon sizes',
        'Created a nav header with logo link and navigation links',
        'Built a SectionContainer layout component and updated Template styling',
        'Added hover states to ThemeSwitch and responsive text sizing',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'tools',
      items: [
        'Created siteMetadata config and moved it to /data',
        'Added @svgr/webpack for SVG component imports',
        'Updated Tailwind config to include the app directory',
        'Added a location update function and /api/loc route',
      ],
    },
  ],
}

export default summary
