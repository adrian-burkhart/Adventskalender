This is a hobby project: An advent calendar for family and friends with daily quiz questions.

I've programmed the app to run independently in the future. With Sanity CMS, questions can be added to each year, including answer options and audio files.

I am using Supabase and Next.js for auth and to keep track of users and their scores, which get displayed in a ranking for each year.

## Development

Requires Node 22.

```sh
cp .env.example .env.local   # point it at a staging Supabase project, never production
npm install
npm run dev
```

Checks (the same ones CI runs):

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Database changes live in `supabase/migrations/` and are applied to the staging project first, production only at switch-over.

`src/proxy.ts` is the only auth guard: every page except `/login`, `/impressum`, `/datenschutz` and `/auth/*` needs a session.
