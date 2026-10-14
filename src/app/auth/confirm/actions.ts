"use server"

import { redirect } from "next/navigation"
import { confirmTarget, parseEmailOtpType } from "@/lib/auth/redirect"
import { createClient } from "@/lib/supabase/server"

function field(formData: FormData, name: string): string | null {
  const value = formData.get(name)
  return typeof value === "string" && value !== "" ? value : null
}

/**
 * Confirms a link from an auth e-mail. Runs on a button press, not on page
 * load, so mail scanners that open links can't use up the one-time token.
 * Returns where to go next; the browser loads that page in full, so it
 * starts with the new session (see ConfirmForm).
 */
export async function confirmLink(formData: FormData): Promise<string> {
  const tokenHash = field(formData, "token_hash")
  const type = parseEmailOtpType(field(formData, "type"))
  const code = field(formData, "code")
  const next = field(formData, "next")

  const supabase = await createClient()
  let errorCode: string | null = null

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (error) errorCode = error.code ?? "unknown"
  } else if (code) {
    // Links from the default templates (PKCE flow).
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) errorCode = error.code ?? "unknown"
  } else {
    errorCode = "missing"
  }

  if (errorCode) {
    redirect(`/auth/confirm?fehler=${encodeURIComponent(errorCode)}`)
  }

  return confirmTarget(type, next)
}
