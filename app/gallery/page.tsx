import Gallery from '@/components/Gallery'
import type { GalleryImage } from '@/components/Gallery'
import SectionContainer from '@/components/SectionContainer'

const allImages: GalleryImage[] = [
  { src: '/static/images/gallery/_retouched_focus_happy_neck_massage.jpg', alt: 'Neck massage' },
  { src: '/static/images/gallery/neck_holding_content.jpg', alt: 'Neck holding technique' },
  { src: '/static/images/gallery/neck_massage_happy_relaxed.jpg', alt: 'Relaxed neck massage' },
  { src: '/static/images/gallery/scalp_massage_focused.jpg', alt: 'Scalp massage' },
  {
    src: '/static/images/gallery/f46cd959a0919065b60c68ee1bc03f53-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/hands_on_back.jpg', alt: 'Hands on back' },
  {
    src: '/static/images/gallery/7c510239e56e5995f8a804ed63e0dac2-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/75096f2ddf1a6d720297dcdb93da4fca-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/c77106eb3b6c89d15037ba95ff73cc2f-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/514386467f70a1fc77d8ad5c36cccf88-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/_retouched_leg_massage_hands_cross_over.jpg',
    alt: 'Leg massage crossover technique',
  },
  { src: '/static/images/gallery/foot_rub_focused.jpg', alt: 'Foot rub' },
  { src: '/static/images/gallery/_retouched_focus_foot.jpg', alt: 'Foot massage' },
  { src: '/static/images/gallery/leg_massage_focused_landscape.jpg', alt: 'Leg massage' },
  {
    src: '/static/images/gallery/28f3419fd0a9f5ecba7592f84c26efed-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/38c8863aa34f1acf6f88546fabcd3081-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/a9f3b74c91045064d52f0d15741d0994-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/eb73d99b0b15b7be1d4a5e392b382dc6-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/eb3963a1e0a370d741fdabc3cde63048-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/426d5c406a4409455fc44509fc5d8274-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/_retouched_focus_chair_massage_elbow.jpg',
    alt: 'Chair massage elbow technique',
  },
  { src: '/static/images/gallery/chair_massage_happy.jpg', alt: 'Chair massage' },
  {
    src: '/static/images/gallery/41aee5a1780d995e30cddbb70762db2b-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/280abffd34fbb5df5de4ead89821bf13-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/a46d7ce823d6ae558684f52c206e0f4c-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/headshot_hat.jpg', alt: 'Trillium with hat' },
  {
    src: '/static/images/gallery/44d2227fc9d4193835f67e1d0c98bc5c-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/_retouched_no_hat_headshot.jpg', alt: 'Trillium headshot' },
]

export default function Page() {
  return (
    <SectionContainer>
      <Gallery images={allImages} columns={3} />
    </SectionContainer>
  )
}
