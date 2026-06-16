import { ReactNode } from 'react'
import clsx from 'clsx'
import { Box } from '@/components/ui/box'
interface Props {
  children: ReactNode
  colorClasses?: string
  positionClasses?: string
}

export default function SectionContainer({ children, colorClasses, positionClasses }: Props) {
  return (
    <section className={clsx(colorClasses, positionClasses)}>
      <Box className={'mx-auto max-w-4xl px-4 sm:px-6 xl:max-w-5xl xl:px-0'}>{children}</Box>
    </section>
  )
}
