"use client"

import { FeatureFlag, getFeatureFlag } from "./feature-flags"

/**
 * Calls the app's own API. Sends the test-mode flag along; the server only
 * honours it for admins.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  if (init.body) headers.set("content-type", "application/json")
  if (getFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)) {
    headers.set("x-test-mode", "1")
  }
  const response = await fetch(path, { ...init, headers, cache: "no-store" })
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path}: ${response.status}`)
  }
  return (await response.json()) as T
}
