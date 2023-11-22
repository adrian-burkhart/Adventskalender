import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"
import { useEffect } from "react"

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    if (user) {
      window.location.href = "/"
    }
  })

  if (!user) {
    return (
      <Auth
        redirectTo="/"
        supabaseClient={supabaseClient}
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: "Deine E-Mail-Adresse",
              password_label: "Dein Passwort",
              email_input_placeholder: "Deine E-Mail-Adresse",
              password_input_placeholder: "Dein Passwort",
              button_label: "Einloggen",
              loading_button_label: "Wird eingeloggt...",
              link_text:
                "Du hast schon einen Account? Dann kannst du dich hier einloggen.",
            },
            sign_up: {
              email_label: "Deine E-Mail-Adresse",
              password_label: "Dein Passwort",
              email_input_placeholder: "Deine E-Mail-Adresse",
              password_input_placeholder: "Dein Passwort",
              button_label: "Registrieren",
              loading_button_label: "Wird registriert...",
              link_text:
                "Du hast keinen Account? Dann kannst du dich hier registrieren.",
              confirmation_text:
                "Du bekommst eine E-Mail mit einem Bestätigungslink.",
            },
            forgotten_password: {
              email_label: "Deine E-Mail-Adresse",
              password_label: "Dein Passwort",
              email_input_placeholder: "Deine E-Mail-Adresse",
              button_label: "Passwort zurücksetzen (E-Mail senden)",
              loading_button_label: "E-Mail wird gesendet...",
              link_text: "Du hast dein Passwort vergessen?",
              confirmation_text:
                "Schaue in deine E-Mails für den Link zum Zurücksetzen deines Passwortes.",
            },
            update_password: {
              password_label: "Dein neues Passwort",
              password_input_placeholder: "Dein neues Passwort",
              button_label: "Passwort aktualisieren",
              loading_button_label: "Passwort wird aktualisiert...",
              confirmation_text: "Dein Passwort wurde aktualisiert.",
            },
          },
        }}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#ef4444",
                brandAccent: "darkred",
              },
            },
          },
        }}
      />
    )
  }
}

export default LoginPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }

  return {
    props: {
      initialSession: session,
    },
  }
}
