import Gallery from '@/components/Gallery'
import type { GalleryImage } from '@/components/Gallery'
import SectionContainer from '@/components/SectionContainer'

const allImages: GalleryImage[] = [
  { src: '/static/images/gallery/_retouched_focus_happy_neck_massage.jpg', alt: 'Neck massage' },
  { src: '/static/images/gallery/neck_holding_content.jpg', alt: 'Neck holding technique' },
  { src: '/static/images/gallery/neck_massage_happy_relaxed.jpg', alt: 'Relaxed neck massage' },
  { src: '/static/images/gallery/scalp_massage_focused.jpg', alt: 'Scalp massage' },
  { src: '/static/images/gallery/table_neck_cradle_supine.jpg', alt: 'Table neck cradle supine' },
  { src: '/static/images/gallery/hands_on_back.jpg', alt: 'Hands on back' },
  { src: '/static/images/gallery/table_shoulder_forearm.jpg', alt: 'Table shoulder forearm work' },
  { src: '/static/images/gallery/table_deep_neck_trap.jpg', alt: 'Table deep neck and trap work' },
  { src: '/static/images/gallery/table_upper_back_smiling.jpg', alt: 'Table upper back massage' },
  {
    src: '/static/images/gallery/table_shoulder_press_closeup.jpg',
    alt: 'Table shoulder press closeup',
  },
  {
    src: '/static/images/gallery/_retouched_leg_massage_hands_cross_over.jpg',
    alt: 'Leg massage crossover technique',
  },
  { src: '/static/images/gallery/foot_rub_focused.jpg', alt: 'Foot rub' },
  { src: '/static/images/gallery/_retouched_focus_foot.jpg', alt: 'Foot massage' },
  { src: '/static/images/gallery/leg_massage_focused_landscape.jpg', alt: 'Leg massage' },
  { src: '/static/images/gallery/table_ankle_massage.jpg', alt: 'Table ankle massage' },
  { src: '/static/images/gallery/table_calf_massage.jpg', alt: 'Table calf massage' },
  { src: '/static/images/gallery/table_leg_massage_tattoo.jpg', alt: 'Table leg massage' },
  {
    src: '/static/images/gallery/table_leg_massage_tattoo_alt.jpg',
    alt: 'Table leg massage alternate angle',
  },
  {
    src: '/static/images/gallery/table_foot_ankle_focused.jpg',
    alt: 'Table foot and ankle massage',
  },
  {
    src: '/static/images/gallery/portrait_arms_crossed_burgundy.jpg',
    alt: 'Trillium portrait arms crossed',
  },
  {
    src: '/static/images/gallery/_retouched_focus_chair_massage_elbow.jpg',
    alt: 'Chair massage elbow technique',
  },
  { src: '/static/images/gallery/chair_massage_happy.jpg', alt: 'Chair massage' },
  { src: '/static/images/gallery/massage_chair_smiling.jpg', alt: 'Massage chair session smiling' },
  {
    src: '/static/images/gallery/massage_chair_upper_back.jpg',
    alt: 'Massage chair upper back work',
  },
  {
    src: '/static/images/gallery/massage_chair_shoulders_wide.jpg',
    alt: 'Massage chair shoulder work',
  },
  { src: '/static/images/gallery/headshot_hat.jpg', alt: 'Trillium with hat' },
  {
    src: '/static/images/gallery/headshot_branded_hat.jpg',
    alt: 'Trillium headshot with branded hat',
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
