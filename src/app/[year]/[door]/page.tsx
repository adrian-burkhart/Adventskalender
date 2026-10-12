"use client"

import { notFound, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { memo } from "react"
import { usePlayer, useYears } from "@/lib/hooks"
import QuestionForm from "@/components/question-form"
import { parseDoorParams } from "@/lib/routes"
import { ERROR_TEXT, LOADING_TEXT } from "@/lib/texts"

const Page = memo(() => {
  const params = useParams<{ year: string; door: string }>()
  const door = parseDoorParams(params.year, params.door)
  const { player, error: playerError } = usePlayer()
  const { years, loading, error } = useYears()

  if (!door) {
    notFound()
  }

  if (error || playerError) {
    return <div>{ERROR_TEXT}</div>
  }

  if (loading || !player) {
    return <div>{LOADING_TEXT}</div>
  }

  const year = years?.find((y) => y.year === door.year)
  const question = year?.questions?.find(
    (q) => q.door_number === door.doorNumber,
  )

  return (
    <Layout>
      <main className="flex h-full items-center justify-center">
        {year && question ? (
          <QuestionForm
            selectedYear={year}
            player={player}
            doorNumber={door.doorNumber}
            question={question}
          />
        ) : (
          <div>Frage fehlt noch. Sorry ;(</div>
        )}
      </main>
    </Layout>
  )
})

export default Page
