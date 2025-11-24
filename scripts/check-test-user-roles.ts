import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTestUserRoles() {
  const testEmails = [
    process.env.TEST_ADMIN_EMAIL!,
    process.env.TEST_USER_EMAIL!,
  ]

  console.log('Checking test user roles in Supabase...\n')

  for (const email of testEmails) {
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === email)

    if (!authUser) {
      console.log(`❌ ${email}: No auth user found`)
      continue
    }

    console.log(`✓ ${email}: Auth user exists (ID: ${authUser.id})`)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.log(`  ❌ Profile error: ${error.message}`)
    } else if (!profile) {
      console.log(`  ❌ No profile row in database`)
    } else {
      console.log(`  ✓ Profile exists`)
      console.log(`    - Role: ${profile.role || 'NULL'}`)
    }
    console.log()
  }
}

checkTestUserRoles().catch(console.error)
