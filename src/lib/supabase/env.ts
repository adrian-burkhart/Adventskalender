// NEXT_PUBLIC_* values are inlined at build time, so they must be read with
// literal property access (no dynamic lookup).
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
