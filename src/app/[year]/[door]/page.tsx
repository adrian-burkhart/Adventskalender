"use client"

import { notFound, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { memo } from "react"
import QuestionForm from "@/components/question-form"
import { parseDoorParams } from "@/lib/routes"

const Page = memo(() => {
  const params = useParams<{ year: string; door: string }>()
  const door = parseDoorParams(params.year, params.door)

  if (!door) {
    notFound()
  }

  return (
    <Layout>
      <main className="flex h-full items-center justify-center">
        <QuestionForm year={door.year} doorNumber={door.doorNumber} />
      </main>
    </Layout>
  )
})

export default Page
