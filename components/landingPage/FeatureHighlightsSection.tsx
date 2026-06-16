import { FaLeaf, FaClock, FaHeart } from 'react-icons/fa'
import { FaMedal } from 'react-icons/fa6'
import { home } from '@/app/content'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const featureIcons = [
  <FaHeart key={0} />,
  <FaMedal key={1} />,
  <FaLeaf key={2} />,
  <FaClock key={3} />,
]

export default function FeatureHighlightsSection() {
  return (
    <Stack className="w-full md:pl-24 xl:px-0" direction="row" align="center" justify="center">
      <Box className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:w-full xl:grid-cols-4">
        {home.features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={featureIcons[index]}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </Box>
    </Stack>
  )
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <Stack direction="row" align="center" gap={4} className="sm:items-start">
      <Stack
        className="bg-primary-100 relative rounded-full p-8"
        direction="row"
        align="center"
        justify="center"
      >
        <Box className="text-primary-600 absolute text-3xl">{icon}</Box>
      </Stack>
      <Box>
        <Box className="text-lg font-bold sm:text-base">{title}</Box>
        <Box className="text-base text-accent-500">{description}</Box>
      </Box>
    </Stack>
  )
}
