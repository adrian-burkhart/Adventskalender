import { DateTime, Settings } from "luxon"

Settings.defaultZone = "utc"

enum Timezone {
  UTC = "UTC",
  LOCAL = "LOCAL",
}

const TIMEZONE_LUXON_MAPPING = {
  [Timezone.UTC]: "utc",
  [Timezone.LOCAL]: "system",
}

export function dateTimeFromIso(dateIso: string, tz = Timezone.UTC): DateTime {
  const luxonTz = TIMEZONE_LUXON_MAPPING[tz]

  return DateTime.fromISO(dateIso, { zone: luxonTz }).setZone(luxonTz)
}

function dateNow(tz: Timezone) {
  return DateTime.now().setZone(tz)
}

export function dateNowUtc() {
  return dateNow(Timezone.UTC)
}
