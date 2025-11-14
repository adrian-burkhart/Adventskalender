import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { GetServerSidePropsContext } from "next"
import { useEffect, useState } from "react"
import welcomeImage from "../../public/images/welcome.webp"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { User } from "@supabase/supabase-js"

const LoginPage = () => {
  const [supabaseClient] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      setUser(user)
      if (user) {
        window.location.href = "/"
      }
    }
    checkUser()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          window.location.href = "/"
        }
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabaseClient])

  if (!user) {
    return (
      <div className="flex flex-col items-center">
        <Auth
          redirectTo={
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : "/login"
          }
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
        <div className="mb-6">
          {"Melde dich gerne bei uns, wenn du Probleme beim registrieren hast."}
        </div>
        <Image src={welcomeImage} alt="" />
      </div>
    )
  }
}

export default LoginPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerClient(ctx)
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
    props: {},
  }
}
