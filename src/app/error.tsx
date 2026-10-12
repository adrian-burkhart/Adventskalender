"use client"

import Button from "@/components/button"
import { ERROR_TEXT } from "@/lib/texts"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center gap-6 pt-16 text-center">
      <div>{ERROR_TEXT}</div>
      <Button onClick={reset}>Nochmal versuchen</Button>
    </main>
  )
}
