import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'
import pagesData from '@/data/pages.json'
import { H1 } from '@/components/ui/heading'
import { TextLgMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const projectsText = pagesData.projects

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  return (
    <Box className="divide-y divide-accent-200 dark:divide-accent-700">
      <Box className="space-y-2 pt-6 pb-8 md:space-y-5">
        <H1 className="sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          {projectsText.heading}
        </H1>
        <TextLgMuted>{projectsText.description}</TextLgMuted>
      </Box>
      <Box className="container py-12">
        <Stack className="-m-4" direction="row" wrap>
          {projectsData.map((d) => (
            <Card
              key={d.title}
              title={d.title}
              description={d.description}
              imgSrc={d.imgSrc}
              href={d.href}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
