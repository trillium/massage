import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

export async function setupAdminSession(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured for testing')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const testAdminEmail = process.env.TEST_ADMIN_EMAIL || 'trilliummassagela@gmail.com'
  const testAdminPassword = process.env.TEST_ADMIN_PASSWORD

  if (!testAdminPassword) {
    throw new Error(
      'TEST_ADMIN_PASSWORD environment variable required for authenticated tests. Set up a test admin user with password authentication.'
    )
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: testAdminEmail,
    password: testAdminPassword,
  })

  if (error) {
    throw new Error(`Failed to authenticate test admin: ${error.message}`)
  }

  if (!data.session) {
    throw new Error('No session returned from Supabase auth')
  }

  const cookies = [
    {
      name: 'sb-access-token',
      value: data.session.access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    },
    {
      name: 'sb-refresh-token',
      value: data.session.refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ]

  await page.context().addCookies(cookies)

  return data.session
}
