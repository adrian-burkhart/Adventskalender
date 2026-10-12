import type { NextRequest } from "next/server"
import { getDoor } from "@/lib/door-api"

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; door: string }> },
) {
  return getDoor(request, params)
}
