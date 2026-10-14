import { notFound } from "next/navigation"
import Vorschau from "./vorschau"

// The design proposals, for staging only. Production doesn't show them.
export default function Page() {
  if (process.env.VERCEL_ENV === "production") notFound()
  return <Vorschau />
}
