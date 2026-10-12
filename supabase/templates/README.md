# Auth e-mail templates

Supabase doesn't read these files. Paste them into the dashboard:
Authentication → Emails → Templates.

| Template           | Subject                                 | File                |
| ------------------ | --------------------------------------- | ------------------- |
| Confirm sign up    | Bestätige deine E-Mail-Adresse          | `confirmation.html` |
| Magic link or OTP  | Dein Login-Code für den Adventskalender | `magic_link.html`   |
| Reset password     | Neues Passwort für den Adventskalender  | `recovery.html`     |

All links go to `/auth/confirm`, which checks them on the server after a
button press, so they work on any device and mail scanners can't use them up.
`{{ .Token }}` is the 6-digit code for the login form.
