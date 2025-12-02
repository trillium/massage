'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function AuthStateListener() {
  const posthog = usePostHog()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const identifyUser = (email: string, userId: string, provider?: string) => {
      if (!posthog._isIdentified()) {
        posthog.identify(email, {
          email,
          user_id: userId,
          provider: provider || 'email',
          identified_at: new Date().toISOString(),
          user_type: 'authenticated',
        })
      }
    }

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.email) {
        identifyUser(session.user.email, session.user.id, session.user.app_metadata?.provider)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        identifyUser(session.user.email, session.user.id, session.user.app_metadata?.provider)
      }

      if (event === 'SIGNED_OUT' && posthog._isIdentified()) {
        posthog.reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [posthog, supabase])

  return null
}
