# Features Documentation

This document outlines the key features implemented in the Trillium Massage website, a Next.js-based platform for in-home massage therapy services in the LA Metro Area.

## Core Features

### Homepage

- Hero section with call-to-action
- Feature highlights showcasing service benefits
- About section with therapist information
- Interactive service area map
- Customer testimonials
- How it works guide
- Pricing information
- Contact form integration
- Book session button linking to booking flow

### Booking System

- Comprehensive appointment booking interface (`/book`)
- Instant confirmation flow (`/instantConfirm`)
- Booking confirmation page (`/confirmation`)
- Dynamic booking slugs for personalized booking experiences (`/[bookingSlug]`)

### Services Offered

- Swedish Massage: Relaxing full-body massage with gentle to medium pressure
- Deep Tissue Massage: Targets deeper muscle layers for chronic pain relief
- Back-to-Back Couples Massage: Sessions for up to 4 guests simultaneously
- Onsite/Corporate Massage: Chair or table massage for offices and events

### Content Management

- MDX-based blog system with posts (e.g., promotional offers like free 30-minute sessions)
- Static content generation with Contentlayer
- Image processing and optimization (conversion, resizing)

### Review System

- Customer review submission form
- Review display cards
- Admin interface for review management and moderation

### Admin Panel

- Comprehensive dashboard for business management
- Booking management and tracking
- Event scheduling and management
- Gmail calendar integration for appointment syncing
- Review moderation tools
- User access request handling
- Promotional route management
- Test user flow simulation

### User Management & Authentication

- Secure user authentication system
- Authorization controls for different user roles
- Secure "My Events" URLs for clients
- Automated user link generation scripts

### Communication & Integration

- Gmail API integration for calendar and event management
- Email handling with Nodemailer for confirmations and notifications
- Contact form processing
- Newsletter infrastructure (configured, ready for activation)
- Messaging templates for automated communications

### Maps & Location Services

- Interactive maps using MapLibre GL
- Service area visualization
- Geocoding for address processing
- Drive time calculations
- Static map generation for performance
- Location-based availability

### Availability & Scheduling

- Calendar-based availability management
- Timezone-aware scheduling
- Appointment conflict resolution
- Real-time availability updates

### Payment Processing

- Payment method type definitions
- Secure payment flow integration
- Pricing configuration system

### Promotional Features

- Promotional page creation
- Expired promotion handling
- Ratings correction and management
- Special offer tracking

### Search & Navigation

- Kbar-powered search functionality
- Mobile-responsive navigation
- Sticky navigation options
- Intuitive site structure

### Analytics & Monitoring

- PostHog analytics integration
- Rate limiting for API protection
- Comprehensive error handling and logging

### Technical Features

- RSS feed generation
- RESTful API architecture
- Redux Toolkit state management
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Theme switching (light/dark/system)
- Accessibility compliance (a11y linting)

### Development & Quality Assurance

- Comprehensive testing suite with Vitest
- ESLint and Prettier for code quality
- Husky pre-commit hooks
- Spellcheck integration
- Lint-staged for automated formatting
- Build optimization and analysis

### Deployment & Infrastructure

- Vercel deployment configuration
- Automated build scripts
- Post-build processing
- Environment-based configuration</content>
  <parameter name="filePath">/Users/trilliumsmith/code/massage/massage/docs/FEATURES.md
