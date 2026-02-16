import Gallery from '@/components/Gallery'
import type { GalleryImage } from '@/components/Gallery'
import SectionContainer from '@/components/SectionContainer'

const testGalleryImages: GalleryImage[] = [
  { src: '/static/images/table/table_square_01.webp', alt: 'Massage table setup 1' },
  { src: '/static/images/table/table_square_02.webp', alt: 'Massage table setup 2' },
  { src: '/static/images/table/table_square_03.webp', alt: 'Massage table setup 3' },
  { src: '/static/images/chair/chair_square_07.webp', alt: 'Massage chair' },
  { src: '/static/images/avatar.jpg', alt: 'Trillium', caption: 'Trillium - Massage Therapist' },
]

export default function Page() {
  return (
    <SectionContainer>
      <Gallery images={testGalleryImages} columns={3} />
    </SectionContainer>
  )
}
