import { ButtonLink } from "@/components/button"

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center gap-6 pt-16 text-center">
      <div>Diese Seite gibt es leider nicht.</div>
      <ButtonLink href="/">Zurück zum Kalender</ButtonLink>
    </main>
  )
}
