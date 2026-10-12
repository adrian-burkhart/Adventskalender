import type { NextRequest } from "next/server"
import { submitAnswer } from "@/lib/door-api"

export function POST(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; door: string }> },
) {
  return submitAnswer(request, params)
}
