import type { NextRequest } from "next/server"
import { startQuestion } from "@/lib/door-api"

export function POST(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; door: string }> },
) {
  return startQuestion(request, params)
}
