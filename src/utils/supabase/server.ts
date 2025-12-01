import { createServerClient, type CookieOptions, serialize } from '@supabase/ssr'
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'

export function createClient(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse }
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieStore = context.req.cookies
          return Object.entries(cookieStore).map(([name, value]) => ({
            name,
            value: String(value)
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Respect the options provided by Supabase; do not force httpOnly so the
            // browser client can read the session cookies.
            const cookieString = serialize(name, value, {
              ...options,
              path: options?.path ?? '/',
            })

            const res = context.res as any
            const existingSetCookieHeader = res.getHeader('Set-Cookie')

            if (!existingSetCookieHeader) {
              res.setHeader('Set-Cookie', cookieString)
            } else if (typeof existingSetCookieHeader === 'string') {
              res.setHeader('Set-Cookie', [existingSetCookieHeader, cookieString])
            } else {
              res.setHeader('Set-Cookie', [...existingSetCookieHeader, cookieString])
            }
          })
        },
      },
    }
  )
}
