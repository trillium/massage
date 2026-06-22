import { LoginForm } from '@/components/auth/supabase/LoginForm'
import { Suspense } from 'react'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'
import CustomLink from '@/components/Link'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

function LoginContent({ redirectTo }: { redirectTo?: string }) {
  return (
    <Stack
      className="min-h-screen bg-surface-100 px-4"
      direction="row"
      align="center"
      justify="center"
    >
      <Box className="w-full max-w-md">
        <Box variant="card" className="px-8 py-10">
          <Box className="mb-8 text-center">
            <H1>Sign In</H1>
            <TextSmMuted className="mt-2">Enter your email to receive a magic link</TextSmMuted>
          </Box>

          <LoginForm redirectTo={redirectTo} />
        </Box>

        <TextSmMuted className="mt-6 text-center">
          New here?{' '}
          <CustomLink href="/" classes="font-medium text-primary-600 hover:text-primary-500">
            Learn more
          </CustomLink>
        </TextSmMuted>
      </Box>
    </Stack>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <Suspense
      fallback={
        <Stack className="min-h-screen" direction="row" align="center" justify="center">
          <Box className="text-center">
            <Box className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-primary-600"></Box>
          </Box>
        </Stack>
      }
    >
      <LoginContent redirectTo={redirectTo} />
    </Suspense>
  )
}
