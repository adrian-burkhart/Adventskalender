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
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={["google", "github"]}
        socialLayout="horizontal"
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
