import Link from "next/link"
import { usePlayers } from "@/lib/hooks"
import { useUpdatePlayerScore } from "@/lib/hooks"

export default function Home() {
  const { players, error: fetchError, loading: fetchLoading } = usePlayers()
  const {
    updatePlayerScore,
    loading: updateLoading,
    error: updateError,
  } = useUpdatePlayerScore()

  const handleUpdateScore = (playerId: string, newScore: number) => {
    updatePlayerScore(playerId, newScore)
  }

  if (fetchLoading || updateLoading) {
    return <div>Loading...</div>
  }

  if (fetchError || updateError) {
    return <div>Error: {(fetchError || updateError)!.message}</div>
  }

  return (
    <main>
      <Link href="/login">Login</Link>
      <div className="flex flex-col items-start justify-start gap-4">
        {players &&
          players.map((player) => (
            <div className="flex flex-col bg-gray-500" key={player.id}>
              <div>Id: {player.id}</div>
              <div>Score: {player.score}</div>
              <button
                onClick={() => handleUpdateScore(player.id, player.score + 1)}
              >
                Increment Score
              </button>
            </div>
          ))}
      </div>
    </main>
  )
}
