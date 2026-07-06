import EdgePrintAdTemplate from '../_components/EdgePrintAdTemplate'

export const dynamic = 'force-dynamic'

export default function FifaFan50PrintPage() {
  return (
    <EdgePrintAdTemplate
      bookingUrl="https://airbnb.com/sv/trilliummassage?modal=menu&menuItem=3"
      heroImage={{
        src: '/static/images/blog/airbnb-fifafan50-promo.png',
        alt: 'Soccer ball with 50% panels floating between a massage chair and table on a grassy field',
      }}
      headline="50% Off — FIFA Fan Promo"
      subtitle="Use code FIFAFAN50 at Airbnb checkout · Ends July 21st, 2026"
      qrLabel="Scan to book on Airbnb"
      qrUrlDisplay="airbnb.com/sv/trilliummassage"
      benefits={[
        { role: 'Code', description: 'FIFAFAN50 — enter at Airbnb checkout' },
        { role: 'Discount', description: '50% off, up to $100 savings' },
        { role: 'Deadline', description: 'Book by end of day July 21st, 2026' },
      ]}
      sessionDetails={[
        '"For the Fans: 75m" ($200) → $100 — max discount tier',
        'Code must be applied at checkout — cannot be added after',
        'Verify the discount is applied before completing your booking',
        'Session can be scheduled for after the July 21st deadline',
      ]}
      footerNote="The $200 deep link above jumps straight to the max-discount tier — other durations work too, up to the $100 cap"
    />
  )
}
