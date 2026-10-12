"use client"

import type { AuthError } from "@supabase/supabase-js"
import Image from "next/image"
import { useState, type FormEvent } from "react"
import {
  AuthField,
  AuthFields,
  AuthForm,
  AuthLink,
  AuthLinks,
  AuthSubmit,
  AuthText,
} from "@/components/auth-form"
import Footer from "@/components/footer"
import { authErrorMessage } from "@/lib/auth/errors"
import { NEW_PASSWORD_PATH } from "@/lib/auth/redirect"
import { createClient } from "@/lib/supabase/client"
import welcomeImage from "../../../public/images/welcome.webp"

type Mode =
  | "password"
  | "code"
  | "code-sent"
  | "forgot"
  | "forgot-sent"
  | "signup"
  | "signup-sent"

const MIN_PASSWORD_LENGTH = 6

// A full page load, so the proxy and every provider see the new session.
function goTo(path: string) {
  window.location.assign(path)
}

function confirmUrl(next?: string) {
  const url = new URL("/auth/confirm", window.location.origin)
  if (next) url.searchParams.set("next", next)
  return url.toString()
}

export default function LoginPage() {
  // Auth calls run in the browser on purpose: Supabase rate-limits per IP,
  // and from the server every player would share Vercel's IP.
  const [supabase] = useState(() => createClient())
  const [mode, setMode] = useState<Mode>("password")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const switchTo = (next: Mode) => {
    setMode(next)
    setError(null)
    setCode("")
  }

  const submit =
    (action: () => Promise<AuthError | null | void>) =>
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const authError = await action()
        if (authError) setError(authErrorMessage(authError))
      } catch {
        setError(authErrorMessage(null))
      } finally {
        setBusy(false)
      }
    }

  const signIn = submit(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return error
    goTo("/")
  })

  const sendCode = submit(async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: confirmUrl() },
    })
    if (error) return error
    switchTo("code-sent")
  })

  const verifyCode = (type: "email" | "recovery") =>
    submit(async () => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type,
      })
      if (error) return error
      goTo(type === "recovery" ? NEW_PASSWORD_PATH : "/")
    })

  const sendReset = submit(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: confirmUrl(NEW_PASSWORD_PATH),
    })
    if (error) return error
    switchTo("forgot-sent")
  })

  const signUp = submit(async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: confirmUrl(),
      },
    })
    if (error) return error
    // With "Confirm email" on, Supabase hides existing addresses this way.
    if (data.user && data.user.identities?.length === 0) {
      setError(authErrorMessage({ code: "user_already_exists" }))
      return
    }
    if (data.session) {
      goTo("/")
      return
    }
    switchTo("signup-sent")
  })

  const emailField = (
    <AuthField
      label="Deine E-Mail-Adresse"
      id="email"
      type="email"
      placeholder="Deine E-Mail-Adresse"
      autoComplete="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  )

  const codeField = (
    <AuthField
      label="Dein Code"
      id="code"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={10}
      placeholder="123456"
      autoComplete="one-time-code"
      required
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
  )

  const backToLogin = (
    <AuthLink onClick={() => switchTo("password")}>ZUM LOGIN</AuthLink>
  )

  const errorText = error && <AuthText tone="error">{error}</AuthText>

  let form
  switch (mode) {
    case "code":
      form = (
        <AuthForm onSubmit={sendCode}>
          <AuthText>
            Wir schicken dir einen Code per E-Mail. Damit kannst du dich ohne
            Passwort einloggen.
          </AuthText>
          {errorText}
          <AuthFields>{emailField}</AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird geschickt …" : "Code schicken"}
          </AuthSubmit>
          <AuthLinks>{backToLogin}</AuthLinks>
        </AuthForm>
      )
      break

    case "code-sent":
      form = (
        <AuthForm onSubmit={verifyCode("email")}>
          <AuthText>
            Wir haben dir eine E-Mail an {email} geschickt. Gib den Code daraus
            ein oder tippe auf den Link in der E-Mail.
          </AuthText>
          {errorText}
          <AuthFields>{codeField}</AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird eingeloggt …" : "Einloggen"}
          </AuthSubmit>
          <AuthLinks>
            <AuthLink onClick={() => switchTo("code")}>
              Code nochmal schicken
            </AuthLink>
            {backToLogin}
          </AuthLinks>
        </AuthForm>
      )
      break

    case "forgot":
      form = (
        <AuthForm onSubmit={sendReset}>
          <AuthText>
            Kein Problem! Wir schicken dir eine E-Mail, mit der du dir ein neues
            Passwort aussuchen kannst.
          </AuthText>
          {errorText}
          <AuthFields>{emailField}</AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird geschickt …" : "E-Mail schicken"}
          </AuthSubmit>
          <AuthLinks>{backToLogin}</AuthLinks>
        </AuthForm>
      )
      break

    case "forgot-sent":
      form = (
        <AuthForm onSubmit={verifyCode("recovery")}>
          <AuthText>
            Falls es zu {email} ein Konto gibt, haben wir dir eine E-Mail
            geschickt. Tippe auf den Link darin oder gib den Code ein.
          </AuthText>
          {errorText}
          <AuthFields>{codeField}</AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird geprüft …" : "Weiter"}
          </AuthSubmit>
          <AuthLinks>
            <AuthLink onClick={() => switchTo("forgot")}>
              E-Mail nochmal schicken
            </AuthLink>
            {backToLogin}
          </AuthLinks>
        </AuthForm>
      )
      break

    case "signup":
      form = (
        <AuthForm onSubmit={signUp}>
          {errorText}
          <AuthFields>
            <AuthField
              label="Dein Name"
              id="name"
              type="text"
              placeholder="So heißt du in der Rangliste"
              autoComplete="nickname"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {emailField}
            <AuthField
              label="Dein Passwort"
              id="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird registriert …" : "Registrieren"}
          </AuthSubmit>
          <AuthLinks>{backToLogin}</AuthLinks>
        </AuthForm>
      )
      break

    case "signup-sent":
      form = (
        <AuthForm>
          <AuthText>
            Du bekommst eine E-Mail mit einem Bestätigungslink.
          </AuthText>
          <AuthLinks>{backToLogin}</AuthLinks>
        </AuthForm>
      )
      break

    case "password":
    default:
      form = (
        <AuthForm onSubmit={signIn}>
          {errorText}
          <AuthFields>
            {emailField}
            <AuthField
              label="Dein Passwort"
              id="password"
              type="password"
              placeholder="Dein Passwort"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </AuthFields>
          <AuthSubmit disabled={busy}>
            {busy ? "Wird eingeloggt …" : "Einloggen"}
          </AuthSubmit>
          <AuthLinks>
            <AuthLink onClick={() => switchTo("code")}>
              Login-Code per E-Mail
            </AuthLink>
            <AuthLink onClick={() => switchTo("forgot")}>
              Passwort vergessen?
            </AuthLink>
            <AuthLink onClick={() => switchTo("signup")}>
              ZUR REGISTRIERUNG
            </AuthLink>
          </AuthLinks>
        </AuthForm>
      )
  }

  return (
    <>
      <div className="flex flex-col items-center pt-4">
        {form}
        <Image src={welcomeImage} alt="" className="mt-6" />
      </div>
      <Footer />
    </>
  )
}
