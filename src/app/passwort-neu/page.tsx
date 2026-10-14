"use client"

import { useState, type FormEvent } from "react"
import {
  AuthField,
  AuthFields,
  AuthForm,
  AuthSubmit,
  AuthText,
} from "@/components/auth-form"
import { ButtonLink } from "@/components/button"
import Layout from "@/components/layout"
import { useSupabaseClient } from "@/lib/auth-context"
import { authErrorMessage } from "@/lib/auth/errors"

const MIN_PASSWORD_LENGTH = 6

export default function NewPasswordPage() {
  const supabase = useSupabaseClient()
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== repeat) {
      setError("Die beiden Passwörter sind nicht gleich.")
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(authErrorMessage(error))
      } else {
        setSaved(true)
      }
    } catch {
      setError(authErrorMessage(null))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-6 text-3xl">Neues Passwort</h1>
        {saved ? (
          <div className="flex flex-col items-center">
            <div className="text-green-500">
              Das hat geklappt! Dein neues Passwort ist gespeichert.
            </div>
            <ButtonLink href="/" className="mt-6">
              Zum Kalender
            </ButtonLink>
          </div>
        ) : (
          <AuthForm onSubmit={handleSubmit}>
            {error && <AuthText tone="error">{error}</AuthText>}
            <AuthFields>
              <AuthField
                label="Neues Passwort"
                id="password"
                type="password"
                placeholder="Mindestens 6 Zeichen"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AuthField
                label="Passwort wiederholen"
                id="password-repeat"
                type="password"
                placeholder="Nochmal dasselbe Passwort"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </AuthFields>
            <AuthSubmit disabled={busy}>
              {busy ? "Wird gespeichert …" : "Passwort speichern"}
            </AuthSubmit>
          </AuthForm>
        )}
      </div>
    </Layout>
  )
}
