import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { usePlayer } from "@/lib/hooks"
import Layout from "@/components/layout"

interface User {
  id: string
  email: string
  phone: string
}

export default function Profile({ user }: { user: User }) {
  const supabaseClient = useSupabaseClient()
  const { player } = usePlayer()

  return (
    <Layout>
      <main>
        <div className="flex flex-col">
          <div className="text-lg">Profil</div>
          {player && (
            <div className="flex flex-col gap-2">
              <div>Hallo {user.email}</div>
              <div>Id: {player.id}</div>
              <div>Erstellt am: {player.created_at}</div>
              <div className="mt-4">Historie der Punkte:</div>
              <div>
                {player.scores.map((score, i) => (
                  <div key={i}>
                    {score.year}: {score.score}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => supabaseClient.auth.signOut()}>
            Ausloggen
          </button>
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  }
}
