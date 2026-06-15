import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { quickLinks } from '@/data/paymentLinks'
import { TextSmMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

export default function QuicklinksPage() {
  return (
    <SectionContainer>
      <Stack className="min-h-[60vh] py-12" direction="col" align="center">
        <Stack className="w-full max-w-md" direction="col" gap={4}>
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              classes={`flex items-center gap-4 rounded-2xl border-2 ${link.accent} bg-surface-50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-surface-900`}
            >
              <link.icon className={`shrink-0 text-2xl ${link.iconColor}`} />
              <div>
                <span className="font-semibold text-accent-900 dark:text-accent-100">
                  {link.label}
                </span>
                <TextSmMuted>{link.description}</TextSmMuted>
              </div>
            </Link>
          ))}
        </Stack>
      </Stack>
    </SectionContainer>
  )
}
