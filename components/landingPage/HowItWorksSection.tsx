import { FaCarAlt } from 'react-icons/fa'
import { FaStopwatch } from 'react-icons/fa6'

import { MdEventAvailable } from 'react-icons/md'
import { HiSparkles } from 'react-icons/hi2'

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
    <section className="bg-gray-50 dark:dark:bg-gray-950">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl dark:text-white">
          How it Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800 dark:text-gray-100"
            >
              <step.icon className="mb-4 h-10 w-10 text-teal-600 dark:text-teal-400" />
              <h3 className="mb-2 text-xl font-semibold dark:text-white">{step.title}</h3>
              <p className="mt-auto text-center text-gray-600 dark:text-gray-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
