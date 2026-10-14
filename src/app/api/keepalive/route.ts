import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseUrl } from "@/lib/supabase/env"

// Vercel Cron calls this once a day (vercel.json). Free Supabase projects
// are paused after about a week without database activity, so this makes
// one tiny query to production and, when configured, to staging.

async function ping(url: string, serviceRoleKey: string) {
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true })
  if (error) throw error
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const targets: [string, string | undefined, string | undefined][] = [
    ["production", supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY],
    [
      "staging",
      process.env.STAGING_SUPABASE_URL,
      process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
    ],
  ]

  const results: Record<string, string> = {}
  for (const [name, url, key] of targets) {
    if (!url || !key) {
      results[name] = "not configured"
      continue
    }
    try {
      await ping(url, key)
      results[name] = "ok"
    } catch (error) {
      console.error(`keepalive ${name}`, error)
      results[name] = "failed"
    }
  }

  const failed = Object.values(results).includes("failed")
  return NextResponse.json(results, {
    status: failed ? 500 : 200,
    headers: { "cache-control": "no-store" },
  })
}
