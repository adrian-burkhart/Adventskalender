import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isPublicPath, legacyDoorRedirect } from "@/lib/routes"
import { supabaseAnonKey, supabaseUrl } from "./env"

/**
 * The single auth guard. Refreshes the Supabase session cookie on every
 * request and sends logged-out visitors to /login.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  const legacyTarget = legacyDoorRedirect(pathname)
  if (legacyTarget) {
    const url = request.nextUrl.clone()
    url.pathname = legacyTarget
    return NextResponse.redirect(url, 308)
  }

  let response = NextResponse.next({ request })
  let cacheHeaders: Record<string, string> = {}

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
        cacheHeaders = headers
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        )
      },
    },
  })

  // Don't put code between createServerClient and getClaims: it verifies the
  // JWT and refreshes an expired session.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = !!data?.claims

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ""
    const redirect = NextResponse.redirect(url)
    // Keep refreshed session cookies, or the browser ends up logged out.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    Object.entries(cacheHeaders).forEach(([key, value]) =>
      redirect.headers.set(key, value),
    )
    return redirect
  }

  if (!isLoggedIn && !isPublicPath(pathname)) {
    return redirectTo("/login")
  }

  // E-mail links land on /login?code=…, which the login page exchanges in
  // the browser, so only redirect a plain /login visit.
  if (
    isLoggedIn &&
    pathname === "/login" &&
    !request.nextUrl.searchParams.has("code")
  ) {
    return redirectTo("/")
  }

  return response
}
