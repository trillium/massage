import { FaLeaf, FaClock, FaHeart } from 'react-icons/fa'
import { FaMedal } from 'react-icons/fa6'

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const features = [
  {
    icon: <FaHeart />,
    title: 'Personalized Care',
    description: 'Tailored to your needs',
  },
  {
    icon: <FaMedal />,
    title: 'Seasoned Practitioner',
    description: 'Certified with over 10 years of experience',
  },
  {
    icon: <FaLeaf />,
    title: 'Eco-Friendly Products',
    description: 'Hypoallergenic lotions and oils',
  },
  {
    icon: <FaClock />,
    title: 'Flexible Hours',
    description: 'Open 7 days a week',
  },
]

export default function FeatureHighlightsSection() {
  return (
    <div className="flex w-full items-center justify-center md:pl-24 xl:px-0">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:w-full xl:grid-cols-4">
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-4 sm:items-start">
      <div className="relative flex items-center justify-center rounded-full bg-teal-100 p-8">
        <div className="absolute text-3xl text-teal-600">{icon}</div>
      </div>
      <div>
        <div className="text-lg font-bold sm:text-base">{title}</div>
        <div className="text-base text-gray-500">{description}</div>
      </div>
    </div>
  )
}
