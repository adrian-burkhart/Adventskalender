import { redirect } from "next/navigation"
import Home from "@/components/home"
import { loadCalendarYears, loadDoorStates } from "@/lib/door-api"
import { getSession } from "@/lib/session"

// The calendar is rendered on the server with the player's doors, so the
// page appears complete instead of loading piece by piece in the browser.
export default async function Page() {
  const { supabase, user } = await getSession()
  if (!user) redirect("/login")

  const initialDoors = await loadCalendarYears()
    .then(async ({ currentYear }) => ({
      year: currentYear,
      doors: await loadDoorStates(
        supabase,
        user.id,
        Number(currentYear),
        false,
      ),
    }))
    .catch((error) => {
      // The calendar then loads the doors itself.
      console.error("home doors", error)
      return undefined
    })

  // A server component renders once per request, so reading the clock here
  // is stable.
  // eslint-disable-next-line react-hooks/purity
  const renderedAt = Date.now()

  return <Home initialDoors={initialDoors} renderedAt={renderedAt} />
}
