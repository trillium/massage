import siteMetadata from '@/data/siteMetadata'
import Image from 'next/image'
import Link from '@/components/Link'
import { GradientText } from '@/components/ui/GradientText'

const { avatar } = siteMetadata

export default function AboutSection() {
  return (
    <section>
      <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[400px] w-full md:h-[500px]">
          <Image
            src={avatar}
            alt="About Kendra Anderson"
            fill
            className="border-primary-500 rounded-lg border-2 object-cover object-[center_25%] shadow-lg"
            priority
          />
        </div>
        <div className="flex h-full flex-col justify-center space-y-4 text-left">
          <h2 className="text-left text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            About <GradientText classes="whitespace-nowrap">Flower Flyther</GradientText>
          </h2>
          <p className="mt-4 w-full text-left text-lg text-gray-600 md:mx-0 dark:text-gray-300">
            Kendra Anderson is an intuitive tarot reader who brings clarity and insight to those
            seeking guidance. Working in the LA Metro Area, Kendra has developed a compassionate
            approach to tarot reading that honors each person's unique journey and free will.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Combining intuitive insight with a deep understanding of tarot symbolism, Kendra creates
            a welcoming, non-judgmental space for exploration and self-discovery. Her readings
            empower clients to gain clarity, find perspective, and navigate life's questions with
            confidence.
          </p>
        </div>
      </div>
    </section>
  )
}
