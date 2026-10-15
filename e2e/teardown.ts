import { createClient } from "@supabase/supabase-js"

/**
 * Deletes the accounts the tests created: every staging user at the test
 * mail domain. Their player and answers go with them (ON DELETE CASCADE).
 * Skipped when the staging service-role key isn't set.
 */
export default async function teardown() {
  const url = process.env.E2E_SUPABASE_URL
  const key = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
  const domain = process.env.E2E_MAIL_DOMAIN
  if (!url || !key || !domain) {
    console.log("e2e teardown: no staging service-role key, keeping test users")
    return
  }
  if (url.includes("cofyrmnqtvvtagrcjqkr")) {
    throw new Error("e2e teardown refuses to run against production")
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const suffix = `@${domain.toLowerCase()}`
  let deleted = 0
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) throw error
    for (const user of data.users) {
      if (user.email?.toLowerCase().endsWith(suffix)) {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) throw error
        deleted++
      }
    }
    if (data.users.length < 200) break
  }
  console.log(`e2e teardown: deleted ${deleted} test user(s)`)
}
