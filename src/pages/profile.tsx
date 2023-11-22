import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { usePlayer, useUpdatePlayerName } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useState } from "react"
import Button from "@/components/button"

interface User {
  id: string
  email: string
  phone: string
}

export default function Profile({ user }: { user: User }) {
  const supabaseClient = useSupabaseClient()
  const { player } = usePlayer()
  const { updatePlayerName } = useUpdatePlayerName()
  const [newName, setNewName] = useState(player?.name ?? "")

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
    }

    if (!player || !newName) {
      return
    }

    updatePlayerName(player, newName)
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  return (
    <Layout>
      <main>
        <div className="flex flex-col text-center">
          <div className="mb-6 text-lg">Profil</div>
          {player && (
            <div className="flex flex-col gap-6">
              <div>Hallo {player.name ?? user.email}</div>

              <div className="flex flex-col gap-1">
                <div>Hier kannst du deinen Namen ändern:</div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                  <input
                    placeholder="Dein Name"
                    id="name"
                    value={newName}
                    onChange={handleNameChange}
                    className="rounded-md border border-yellow-200 bg-transparent p-2 text-sm text-yellow-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                    type="text"
                  />
                  <Button type="submit">Namen ändern</Button>
                </form>
              </div>

              <div className="mt-4">Historie deiner Punkte:</div>
              <div>
                {player.scores.map((score, i) => (
                  <div key={i}>
                    {score.year}: {score.score}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => supabaseClient.auth.signOut()}>
            Ausloggen
          </Button>
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
