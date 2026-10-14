import { notFound } from "next/navigation"
import Layout from "@/components/layout"
import QuestionForm from "@/components/question-form"
import { initialDoorStep } from "@/lib/door-api"
import { parseDoorParams } from "@/lib/routes"

// The door's first step (intro, already answered, locked) is rendered on the
// server, so the page doesn't load it again after it appears.
export default async function Page({
  params,
}: {
  params: Promise<{ year: string; door: string }>
}) {
  const { year, door: doorParam } = await params
  const door = parseDoorParams(year, doorParam)
  if (!door) notFound()

  const initial = await initialDoorStep(door.year, door.doorNumber)

  return (
    <Layout>
      <div className="flex h-full items-center justify-center">
        <QuestionForm
          year={door.year}
          doorNumber={door.doorNumber}
          initial={initial}
        />
      </div>
    </Layout>
  )
}
