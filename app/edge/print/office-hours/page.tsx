import { EDGE_MIN } from '@/lib/slugConfigurations/slugs/edge'
import EdgePrintAdTemplate from '../_components/EdgePrintAdTemplate'

export const dynamic = 'force-dynamic'

export default function EdgeOfficeHoursPrintPage() {
  return (
    <EdgePrintAdTemplate
      bookingUrl="https://trilliummassage.la/edge-office"
      heroImage={{
        src: '/static/images/edge/edge-office.png',
        alt: 'Chair massage at Edge office hours',
      }}
      headline="Chair Massage — Office Hours"
      subtitle="Walk in or prebook — no advance notice required"
      qrLabel="Prebook a time"
      qrUrlDisplay="trilliummassage.la/edge-office"
      benefits={[
        {
          role: 'Attendees',
          description: `${EDGE_MIN.office.attendee} min complimentary, tip for time above`,
        },
        {
          role: 'Volunteers',
          description: `${EDGE_MIN.office.volunteer} min complimentary, tip for time above`,
        },
        { role: 'Team', description: 'Fully complimentary, all durations' },
      ]}
      sessionDetails={[
        '5 / 10 / 15 / 20 / 30 minute sessions available',
        'Walk-ins welcome — no booking required',
        'Chair or table massage available',
        'Instant confirmation when you prebook',
      ]}
      footerNote="Also offering table massage at your hotel or Airbnb — scan the QR on the Comes to You flyer"
    />
  )
}
