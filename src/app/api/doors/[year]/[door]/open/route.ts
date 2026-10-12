import type { NextRequest } from "next/server"
import { openDoor } from "@/lib/door-api"

export function POST(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; door: string }> },
) {
  return openDoor(request, params)
}
