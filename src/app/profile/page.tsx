"use client"

import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { useMyScores, usePlayer, useUpdatePlayerName } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useState } from "react"
import Button from "@/components/button"

export default function Profile() {
  const [supabaseClient] = useState(() => createBrowserClient())
  const { player } = usePlayer()
  const { scores } = useMyScores()
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
      <div className="flex w-full max-w-md flex-col gap-6 px-3 text-center">
        <h1 className="text-4xl">Profil</h1>
        {player && (
          <>
            <section className="flex flex-col gap-3">
              <label htmlFor="name" className="text-lg">
                Hier kannst du deinen Namen ändern:
              </label>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4"
              >
                <input
                  placeholder="Dein Name"
                  id="name"
                  maxLength={30}
                  value={newName}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-gold/50 bg-black/30 px-4 py-3 text-lg text-white focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-hidden"
                  type="text"
                />
                <Button type="submit" quiet>
                  {loading ? "Wird gespeichert …" : "Namen ändern"}
                </Button>
              </form>
              {updateSuccess && !error && (
                <div className="text-[#9be3ad]">
                  Das hat geklappt! Dein Name wurde geändert!
                </div>
              )}
              {error && (
                <div role="alert" className="text-[#ff9b9b]">
                  {error.code === "23505"
                    ? "Diesen Namen gibt es schon. Bitte wähle einen anderen."
                    : error.code === "23514"
                      ? "Der Name muss 1 bis 30 Zeichen lang sein."
                      : "Das hat leider nicht geklappt. Bitte versuche es später noch einmal."}
                </div>
              )}
            </section>

            {!!scores?.length && (
              <section>
                <h2 className="text-2xl">Deine Punkte der letzten Jahre</h2>
                <ul className="mt-3 flex flex-col gap-1 text-lg">
                  {[...scores].reverse().map((score) => (
                    <li
                      key={score.year}
                      className="flex justify-between border-b border-gold/15 py-1 last:border-0"
                    >
                      <span>{score.year}</span>
                      <span>{score.score} Punkte</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <div>
          <Button quiet onClick={handleLogout}>
            Ausloggen
          </Button>
        </div>
      </div>
    </Layout>
  )
}
