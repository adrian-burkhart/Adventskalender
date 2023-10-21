import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  if (!user)
    return (
      <Auth
        redirectTo="http://localhost:3000/"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={["google", "github"]}
        socialLayout="horizontal"
      />
    )

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  )
}

export default LoginPage
