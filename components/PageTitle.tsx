import { ReactNode } from 'react'
import { H1 } from '@/components/ui/heading'

interface Props {
  children: ReactNode
}

export default function PageTitle({ children }: Props) {
  return (
    <H1 className="sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
      {children}
    </H1>
  )
}
