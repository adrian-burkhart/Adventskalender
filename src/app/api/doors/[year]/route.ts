import type { NextRequest } from "next/server"
import { getDoorStates } from "@/lib/door-api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  return getDoorStates(request, (await params).year)
}
