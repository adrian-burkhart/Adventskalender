"use client"

import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { usePlayer, useUpdatePlayerName } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useState } from "react"
import Button from "@/components/button"

export default function Profile() {
  const [supabaseClient] = useState(() => createBrowserClient())
  const { player } = usePlayer()
  const { updatePlayerName, loading, error, updateSuccess } =
    useUpdatePlayerName()
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

  const handleLogout = () => {
    supabaseClient.auth.signOut().then(() => {
      window.location.reload()
    })
  }

  return (
    <Layout>
      <main>
        <div className="flex flex-col text-center">
          <div className="mb-6 text-lg">Profil</div>
          {player && (
            <div className="flex flex-col gap-6">
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
                  <Button type="submit">
                    {loading ? "Wird gespeichert …" : "Namen ändern"}
                  </Button>
                </form>
                {updateSuccess && !error && (
                  <div className="text-green-500">
                    Das hat geklappt! Dein Name wurde geändert!
                  </div>
                )}
                {error && (
                  <div className="text-red-500">
                    Das hat leider nicht geklappt. Bitte versuche es später noch
                    einmal.
                  </div>
                )}
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

          <Button onClick={handleLogout}>Ausloggen</Button>
        </div>
      </main>
    </Layout>
  )
}
