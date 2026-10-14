# End-to-end tests

One journey of a new family member against a deployed preview, which uses
the staging Supabase project:

1. Sign up, receive the German confirmation e-mail, confirm, land on the
   calendar.
2. Open door 1 in the calendar and answer it correctly: points in the
   header, the result page, the Rangliste and the profile.
3. Leave the page during door 2: counts as wrong.
4. An answered door can't be answered again; a future door is locked.
5. "Passwort vergessen": e-mail, link, new password; the old one no longer
   works.
6. "Login-Code per E-Mail": e-mail, code, logged in.

E-mails go to a fresh address at Resend's receiving domain and are read
through the Resend API. Afterwards every staging account at that domain is
deleted again.

## Running

The `E2E` workflow runs after every successful preview deployment and on
demand (Actions → E2E → Run workflow, with the preview URL).

Locally:

```sh
E2E_BASE_URL=https://<preview>.vercel.app \
E2E_MAIL_DOMAIN=<id>.resend.app \
E2E_RESEND_API_KEY=… \
E2E_SANITY_TOKEN=… \
npm run e2e
```

| Variable                                            |                                                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `E2E_BASE_URL`                                      | Preview deployment to test (never production)                                      |
| `E2E_MAIL_DOMAIN`                                   | Resend receiving domain (`<id>.resend.app`)                                        |
| `E2E_RESEND_API_KEY`                                | Resend API key with full access (reads received mail)                              |
| `E2E_SANITY_TOKEN`                                  | Sanity read token, to know door 1's right answer                                   |
| `E2E_SUPABASE_URL`, `E2E_SUPABASE_SERVICE_ROLE_KEY` | Staging project, to delete the test accounts (optional)                            |
| `E2E_YEAR`, `E2E_LOCKED_DOOR`                       | Calendar year at the preview's `TEST_NOW` (2025) and a door still locked then (24) |

The staging project must send e-mails through Resend with the same German
templates as production, with "Confirm email" turned on.
