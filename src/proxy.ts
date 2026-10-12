import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Everything except Next internals and static files from /public.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|images/|sounds/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|otf)$).*)",
  ],
}
