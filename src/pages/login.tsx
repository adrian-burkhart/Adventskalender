import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"
import { useEffect } from "react"
import welcomeImage from "../../public/images/welcome.webp"
import Image from "next/image"

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
      <div className="flex flex-col items-center">
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-xl">Schön, dass du schon hier bist!</div>
          <div>
            Die erste Tür wirst du ab dem <b>1. Dezember</b> öffnen können.
          </div>
          <div>
            Bis dahin kannst kannst du dich aber sehr gerne schon einmal hier
            registrieren.
          </div>
          <div className="text-red-500">
            {
              "Klicke zum Registrieren bitte unten auf 'Du hast keinen Account?'"
            }
          </div>
          <div>
            {
              "Melde dich gerne bei uns, wenn du Probleme beim registrieren hast."
            }
          </div>
        </div>
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
                link_text: "ZUM LOGIN",
              },
              sign_up: {
                email_label: "Deine E-Mail-Adresse",
                password_label: "Dein Passwort",
                email_input_placeholder: "Deine E-Mail-Adresse",
                password_input_placeholder: "Dein Passwort",
                button_label: "Registrieren",
                loading_button_label: "Wird registriert...",
                link_text: "ZUR REGISTRIERUNG",
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
          theme="dark"
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
        <Image src={welcomeImage} alt="" />
      </div>
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
