import { expect, test, type Page } from "@playwright/test"
import { doorContent } from "./content"
import { env } from "./env"
import { confirmLink, loginCode, waitForMail, type Mail } from "./mail"

// One new family member, from sign-up to the third login method. Runs as
// one test because every step builds on the account the first one creates.

const runId = Date.now().toString(36)
const name = `E2E ${runId}`
const password = `Erstes-${runId}`
const newPassword = `Neues-${runId}`
const SENDER = "adventskalender-haas.de"

// Supabase sends one e-mail per address per minute at most.
const MAIL_INTERVAL_MS = 62_000
let lastMailAt = 0

async function requestMail(page: Page, send: () => Promise<void>) {
  const wait = lastMailAt + MAIL_INTERVAL_MS - Date.now()
  if (wait > 0) await page.waitForTimeout(wait)
  const since = new Date()
  lastMailAt = Date.now()
  await send()
  return since
}

function expectGermanMail(mail: Mail, subject: string) {
  expect(mail.subject).toBe(subject)
  expect(mail.from).toContain(SENDER)
}

/** Opens a link from an e-mail on the deployment under test. */
async function openConfirmLink(page: Page, link: URL) {
  expect(link.pathname).toBe("/auth/confirm")
  expect(link.searchParams.get("token_hash")).toBeTruthy()
  await page.goto(`/auth/confirm${link.search}`)
}

async function logOut(page: Page) {
  await page.goto("/profile")
  await page.getByRole("button", { name: "Ausloggen" }).click()
  await expect(page).toHaveURL(/\/login$/)
}

async function startQuestion(page: Page, door: number) {
  await page.goto(`/${env.year()}/${door}`)
  await page.getByAltText("Bereit button").click({ force: true })
  await expect(page.getByText(/Countdown: \d+/)).toBeVisible()
}

test("Neue Mitspielerin: registrieren, spielen, Passwort und Login-Code", async ({
  page,
}) => {
  const email = `e2e-${runId}@${env.mailDomain()}`
  const year = env.year()
  const door1 = await doorContent(year, 1)

  await test.step("Registrieren und E-Mail bestätigen", async () => {
    await page.goto("/login")
    await page.getByRole("button", { name: "ZUR REGISTRIERUNG" }).click()
    await page.getByLabel("Dein Name").fill(name)
    await page.getByLabel("Deine E-Mail-Adresse").fill(email)
    await page.getByLabel("Dein Passwort").fill(password)
    const since = await requestMail(page, () =>
      page.getByRole("button", { name: "Registrieren" }).click(),
    )
    await expect(
      page.getByText("Du bekommst eine E-Mail mit einem Bestätigungslink."),
    ).toBeVisible()

    const mail = await waitForMail(email, since)
    expectGermanMail(mail, "Bestätige deine E-Mail-Adresse")
    await openConfirmLink(page, confirmLink(mail))
    await expect(page.getByText("Fast geschafft!")).toBeVisible()
    await page.getByRole("button", { name: "Einloggen" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(`Hallo ${name}!`)).toBeVisible()
  })

  await test.step("Tür 1 öffnen und richtig antworten", async () => {
    await page
      .getByAltText("Tür Nummer 1", { exact: true })
      .click({ force: true })
    // The door opens for 6 seconds, then the door page appears.
    await expect(page).toHaveURL(new RegExp(`/${year}/1$`), {
      timeout: 15_000,
    })
    await expect(page.getByText(/Sobald du auf „Bereit“ tippst/)).toBeVisible()
    await page.getByAltText("Bereit button").click({ force: true })
    await expect(page.getByText(/Countdown: \d+/)).toBeVisible()

    await page.getByLabel(door1.answer.trim(), { exact: true }).check()
    await page.getByRole("button", { name: "Bestätigen" }).click()

    await expect(
      page.getByText(
        `Das war korrekt! Du bekommst dafür ${door1.reward} Punkte.`,
      ),
    ).toBeVisible()
    await expect(
      page.getByText(`Deine Punktzahl ist jetzt: ${door1.reward}`),
    ).toBeVisible()
    await expect(
      page.getByText(`Deine Punkte: ${door1.reward}`, { exact: true }),
    ).toBeVisible()
  })

  await test.step("Tür 2: Seite verlassen zählt als falsch", async () => {
    await startQuestion(page, 2)
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      })
      document.dispatchEvent(new Event("visibilitychange"))
    })
    await expect(
      page.getByText(/Du hast während der Frage die Seite verlassen/),
    ).toBeVisible()
    await expect(page.getByText(/Das war leider falsch!/)).toBeVisible()
    await expect(
      page.getByText(`Deine Punkte: ${door1.reward}`, { exact: true }),
    ).toBeVisible()
  })

  await test.step("Beantwortete und verschlossene Türen", async () => {
    await page.goto(`/${year}/1`)
    await expect(
      page.getByText("Du hast diese Frage bereits beantwortet."),
    ).toBeVisible()

    await page.goto(`/${year}/${env.lockedDoor()}`)
    await expect(
      page.getByText("Diese Tür ist gerade verschlossen."),
    ).toBeVisible()

    await page.goto("/")
    for (const door of [1, 2]) {
      await expect(
        page.getByAltText(`Tür Nummer ${door}`, { exact: true }),
      ).toHaveAttribute("src", /door-answered/)
    }
  })

  await test.step("Rangliste und Profil zeigen die Punkte", async () => {
    await page.goto("/rangliste")
    const row = page
      .locator("div.w-64")
      .filter({ has: page.getByText(name, { exact: true }) })
    await expect(row).toContainText(`Punkte: ${door1.reward}`)
    await expect(row).toContainText("Türchen geöffnet: 2")

    await page.goto("/profile")
    await expect(page.getByText(`${year}: ${door1.reward}`)).toBeVisible()
  })

  await test.step("Passwort vergessen", async () => {
    await logOut(page)
    await page.getByRole("button", { name: "Passwort vergessen?" }).click()
    await page.getByLabel("Deine E-Mail-Adresse").fill(email)
    const since = await requestMail(page, () =>
      page.getByRole("button", { name: "E-Mail schicken" }).click(),
    )
    await expect(page.getByText(/Falls es zu .* ein Konto gibt/)).toBeVisible()

    const mail = await waitForMail(email, since)
    expectGermanMail(mail, "Neues Passwort für den Adventskalender")
    expect(loginCode(mail)).toMatch(/^\d{6,10}$/)
    await openConfirmLink(page, confirmLink(mail))
    await expect(
      page.getByText("Gleich kannst du dir ein neues Passwort aussuchen."),
    ).toBeVisible()
    await page.getByRole("button", { name: "Weiter" }).click()

    await expect(page).toHaveURL(/\/passwort-neu$/)
    await page.getByLabel("Neues Passwort").fill(newPassword)
    await page.getByLabel("Passwort wiederholen").fill(newPassword)
    await page.getByRole("button", { name: "Passwort speichern" }).click()
    await expect(page.getByText("Das hat geklappt!")).toBeVisible()

    await logOut(page)
    await page.getByLabel("Deine E-Mail-Adresse").fill(email)
    await page.getByLabel("Dein Passwort").fill(password)
    await page.getByRole("button", { name: "Einloggen" }).click()
    await expect(page.locator("form [role=alert]")).toBeVisible()

    await page.getByLabel("Dein Passwort").fill(newPassword)
    await page.getByRole("button", { name: "Einloggen" }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(`Hallo ${name}!`)).toBeVisible()
  })

  await test.step("Login-Code per E-Mail", async () => {
    await logOut(page)
    await page.getByRole("button", { name: "Login-Code per E-Mail" }).click()
    await page.getByLabel("Deine E-Mail-Adresse").fill(email)
    const since = await requestMail(page, () =>
      page.getByRole("button", { name: "Code schicken" }).click(),
    )
    await expect(page.getByText(/Wir haben dir eine E-Mail an/)).toBeVisible()

    const mail = await waitForMail(email, since)
    expectGermanMail(mail, "Dein Login-Code für den Adventskalender")
    await page.getByLabel("Dein Code").fill(loginCode(mail))
    await page.getByRole("button", { name: "Einloggen" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(`Hallo ${name}!`)).toBeVisible()
  })
})
