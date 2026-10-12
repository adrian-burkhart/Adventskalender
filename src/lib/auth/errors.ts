const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-Mail-Adresse oder Passwort ist falsch.",
  email_not_confirmed:
    "Du hast deine E-Mail-Adresse noch nicht bestätigt. Schau in dein Postfach.",
  otp_expired:
    "Der Code ist falsch oder abgelaufen. Fordere einfach einen neuen an.",
  otp_disabled: "Zu dieser E-Mail-Adresse gibt es noch kein Konto.",
  user_not_found: "Zu dieser E-Mail-Adresse gibt es noch kein Konto.",
  email_exists:
    "Mit dieser E-Mail-Adresse gibt es schon ein Konto. Logge dich ein oder setze dein Passwort zurück.",
  user_already_exists:
    "Mit dieser E-Mail-Adresse gibt es schon ein Konto. Logge dich ein oder setze dein Passwort zurück.",
  weak_password: "Das Passwort ist zu kurz. Es braucht mindestens 6 Zeichen.",
  same_password: "Das ist dein bisheriges Passwort. Bitte wähle ein neues.",
  email_address_invalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
  validation_failed: "Bitte prüfe deine Eingaben.",
  over_email_send_rate_limit:
    "Wir haben gerade schon viele E-Mails verschickt. Bitte versuche es in ein paar Minuten noch einmal.",
  over_request_rate_limit:
    "Zu viele Versuche. Bitte warte einen Moment und versuche es dann noch einmal.",
  session_not_found:
    "Du bist nicht mehr eingeloggt. Fordere bitte einen neuen Link an.",
  flow_state_not_found:
    "Der Link funktioniert nur in dem Browser, in dem du ihn angefordert hast. Fordere bitte einen neuen an.",
  flow_state_expired: "Der Link ist abgelaufen. Fordere bitte einen neuen an.",
  bad_code_verifier:
    "Der Link funktioniert nur in dem Browser, in dem du ihn angefordert hast. Fordere bitte einen neuen an.",
}

export const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal."

/** German message for a Supabase auth error. */
export function authErrorMessage(
  error: { code?: string | null } | null | undefined,
): string {
  return (error?.code && MESSAGES[error.code]) || GENERIC_ERROR
}
