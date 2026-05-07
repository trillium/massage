import Gallery from '@/components/Gallery'
import type { GalleryImage } from '@/components/Gallery'
import SectionContainer from '@/components/SectionContainer'

const allImages: GalleryImage[] = [
  { src: '/static/images/gallery/headshot_scrubs.jpg', alt: 'Monica — Therapy by Monica' },
  { src: '/static/images/gallery/table_hotel_room.jpg', alt: 'Mobile setup in hotel room' },
  { src: '/static/images/gallery/table_teal_room.jpg', alt: 'Massage table setup' },
  { src: '/static/images/gallery/table_setup_cozy_room.jpg', alt: 'Cozy in-home table setup' },
  { src: '/static/images/gallery/mobile_setup.jpg', alt: 'Mobile luxury massage setup' },
]

export default function Page() {
  return (
    <SectionContainer>
      <Gallery images={allImages} columns={3} />
    </SectionContainer>
  )
}
