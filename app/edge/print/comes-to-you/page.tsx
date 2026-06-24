import { EDGE_MIN } from '@/lib/slugConfigurations/slugs/edge'
import EdgePrintAdTemplate from '../_components/EdgePrintAdTemplate'

export const dynamic = 'force-dynamic'

export default function EdgeComesToYouPrintPage() {
  return (
    <EdgePrintAdTemplate
      bookingUrl="https://trilliummassage.la/edge-comes-to-you"
      heroImage={{
        src: '/static/images/edge/edge-comes-to-you.png',
        alt: 'Massage table on a winding road — Shoulder Work Ahead',
      }}
      headline="Table Massage — Comes to You"
      subtitle="At your hotel, Airbnb, or any location of your choosing"
      qrLabel="Scan to book"
      qrUrlDisplay="trilliummassage.la/edge-comes-to-you"
      benefits={[
        {
          role: 'Attendees',
          description: `+${EDGE_MIN.comesToYou.attendee} minute bonus on any session`,
        },
        {
          role: 'Volunteers',
          description: `+${EDGE_MIN.comesToYou.volunteer} minute bonus on any session`,
        },
        { role: 'Team', description: 'Fully complimentary, no tip necessary' },
      ]}
      sessionDetails={[
        '60 / 90 / 120 minute sessions available',
        'Book at least 2 hours in advance',
        'Table brought to your location — no travel needed',
        'Instant confirmation via email',
      ]}
      footerNote="Also offering drop-in office hours chair massage — scan the QR at the massage station"
    />
  )
}
