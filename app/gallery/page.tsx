import Gallery from '@/components/Gallery'
import type { GalleryImage } from '@/components/Gallery'
import SectionContainer from '@/components/SectionContainer'

const allImages: GalleryImage[] = [
  {
    src: '/static/images/gallery/_retouched_focus_happy_neck_massage.jpg',
    alt: 'Neck massage',
    objectPosition: '18% 30%',
  },
  {
    src: '/static/images/gallery/neck_holding_content.jpg',
    alt: 'Neck holding technique',
    objectPosition: '29% 55%',
  },
  {
    src: '/static/images/gallery/neck_massage_happy_relaxed.jpg',
    alt: 'Relaxed neck massage',
    objectPosition: '33% 49%',
  },
  {
    src: '/static/images/gallery/scalp_massage_focused.jpg',
    alt: 'Scalp massage',
    objectPosition: '20% 43%',
  },
  {
    src: '/static/images/gallery/table_neck_cradle_supine.jpg',
    alt: 'Table neck cradle supine',
    objectPosition: '20% 14%',
  },
  {
    src: '/static/images/gallery/hands_on_back.jpg',
    alt: 'Hands on back',
    objectPosition: '0% 47%',
  },
  {
    src: '/static/images/gallery/table_shoulder_forearm.jpg',
    alt: 'Table shoulder forearm work',
    objectPosition: '31% 29%',
  },
  {
    src: '/static/images/gallery/table_deep_neck_trap.jpg',
    alt: 'Table deep neck and trap work',
    objectPosition: '31% 29%',
  },
  {
    src: '/static/images/gallery/table_upper_back_smiling.jpg',
    alt: 'Table upper back massage',
    objectPosition: '25% 0%',
  },
  {
    src: '/static/images/gallery/table_shoulder_press_closeup.jpg',
    alt: 'Table shoulder press closeup',
    objectPosition: '18% 55%',
  },
  {
    src: '/static/images/gallery/_retouched_leg_massage_hands_cross_over.jpg',
    alt: 'Leg massage crossover technique',
    objectPosition: '25% 20%',
  },
  {
    src: '/static/images/gallery/foot_rub_focused.jpg',
    alt: 'Foot rub',
    objectPosition: '29% 35%',
  },
  {
    src: '/static/images/gallery/_retouched_focus_foot.jpg',
    alt: 'Foot massage',
    objectPosition: '18% 22%',
  },
  {
    src: '/static/images/gallery/leg_massage_focused_landscape.jpg',
    alt: 'Leg massage',
    objectPosition: '50% 18%',
  },
  {
    src: '/static/images/gallery/table_ankle_massage.jpg',
    alt: 'Table ankle massage',
    objectPosition: '14% 27%',
  },
  {
    src: '/static/images/gallery/table_calf_massage.jpg',
    alt: 'Table calf massage',
    objectPosition: '23% 14%',
  },
  {
    src: '/static/images/gallery/table_leg_massage_tattoo.jpg',
    alt: 'Table leg massage',
    objectPosition: '21% 12%',
  },
  {
    src: '/static/images/gallery/table_leg_massage_tattoo_alt.jpg',
    alt: 'Table leg massage alternate angle',
    objectPosition: '35% 27%',
  },
  {
    src: '/static/images/gallery/table_foot_ankle_focused.jpg',
    alt: 'Table foot and ankle massage',
    objectPosition: '45% 43%',
  },
  {
    src: '/static/images/gallery/portrait_arms_crossed_burgundy.jpg',
    alt: 'Trillium portrait arms crossed',
    objectPosition: '39% 23%',
  },
  {
    src: '/static/images/gallery/_retouched_focus_chair_massage_elbow.jpg',
    alt: 'Chair massage elbow technique',
    objectPosition: '27% 32%',
  },
  {
    src: '/static/images/gallery/chair_massage_happy.jpg',
    alt: 'Chair massage',
    objectPosition: '23% 14%',
  },
  {
    src: '/static/images/gallery/massage_chair_smiling.jpg',
    alt: 'Massage chair session smiling',
    objectPosition: '29% 14%',
  },
  {
    src: '/static/images/gallery/massage_chair_upper_back.jpg',
    alt: 'Massage chair upper back work',
    objectPosition: '18% 19%',
  },
  {
    src: '/static/images/gallery/massage_chair_shoulders_wide.jpg',
    alt: 'Massage chair shoulder work',
    objectPosition: '27% 10%',
  },
  {
    src: '/static/images/gallery/headshot_hat.jpg',
    alt: 'Trillium with hat',
    objectPosition: '39% 25%',
  },
  {
    src: '/static/images/gallery/headshot_branded_hat.jpg',
    alt: 'Trillium headshot with branded hat',
    objectPosition: '33% 25%',
  },
  {
    src: '/static/images/gallery/_retouched_no_hat_headshot.jpg',
    alt: 'Trillium headshot',
    objectPosition: '20% 18%',
  },
]

export default function Page() {
  return (
    <SectionContainer>
      <Gallery images={allImages} columns={3} />
    </SectionContainer>
  )
}
