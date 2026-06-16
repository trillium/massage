import { FaCarAlt } from 'react-icons/fa'
import { FaStopwatch } from 'react-icons/fa6'

import { MdEventAvailable } from 'react-icons/md'
import { HiSparkles } from 'react-icons/hi2'
import landing from '@/data/landing.json'
import { H2, H3 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const { heading } = landing.howItWorks

export default function HowItWorksSection() {
  const steps = [
    {
      icon: MdEventAvailable,
      title: 'Request Appointment',
      description: 'Submit your appointment request, we will confirm it promptly.',
    },
    {
      icon: FaCarAlt,
      title: 'Therapist Arrives',
      description: 'Your therapist arrives, ready to help you relax and unwind.',
    },
    {
      icon: FaStopwatch, // Updated icon to better represent setup
      title: 'Prepare Equipment', // Improved title
      description: 'Brief pause for table/chair to be set up (usually under 5 minutes).', // Updated description
    },
    {
      icon: HiSparkles,
      title: 'Enjoy!',
      description: 'Relax and enjoy a rejuvenating massage experience.',
    },
  ]

  return (
    <section className="bg-surface-50 dark:bg-surface-950">
      <Box className="container">
        <H2 className="mb-8 text-center md:text-4xl dark:text-white">{heading}</H2>
        <Box className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <Stack
              direction="col"
              align="center"
              className="rounded-lg bg-surface-50 p-6 text-center shadow dark:bg-surface-800 dark:text-accent-100"
              key={index}
            >
              <step.icon className="mb-4 h-10 w-10 text-primary-600 dark:text-primary-400" />
              <H3 className="mb-2 dark:text-white">{step.title}</H3>
              <TextBase className="mt-auto text-center text-accent-600 dark:text-accent-300">
                {' '}
                {/* ds-ignore */}
                {step.description}
              </TextBase>
            </Stack>
          ))}
        </Box>
      </Box>
    </section>
  )
}
