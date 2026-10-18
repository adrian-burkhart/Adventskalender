import { redirect } from "next/navigation"
import Austausch from "@/components/austausch"
import { loadExchange } from "@/lib/exchange-data"
import { getSession } from "@/lib/session"

export default async function Page() {
  const { supabase, user } = await getSession()
  if (!user) redirect("/login")

  const data = await loadExchange(supabase, user).catch((error) => {
    console.error("austausch", error)
    return null
  })
  return <Austausch data={data} />
}
