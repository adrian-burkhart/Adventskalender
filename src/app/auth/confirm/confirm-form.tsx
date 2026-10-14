"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { AuthForm, AuthSubmit } from "@/components/auth-form"

function Submit({ label }: { label: string }) {
  // Disabled while the link is checked, so a double tap can't use it twice.
  const { pending } = useFormStatus()
  return <AuthSubmit disabled={pending}>{label}</AuthSubmit>
}

/**
 * Sends the confirm form to the server, then loads the next page in full.
 * A client-side navigation would keep the logged-out page data (player,
 * points) the app started with; a full load starts with the new session.
 */
export default function ConfirmForm({
  action,
  submitLabel,
  children,
}: {
  action: (formData: FormData) => Promise<string>
  submitLabel: string
  children: ReactNode
}) {
  return (
    <AuthForm
      action={async (formData) => {
        const target = await action(formData)
        window.location.assign(target)
      }}
    >
      {children}
      <Submit label={submitLabel} />
    </AuthForm>
  )
}
