# Economy Sim

Live page:

[https://miketrounce.github.io/Personal-Projects/economy-sim/](https://miketrounce.github.io/Personal-Projects/economy-sim/)

A small browser game where you set tax, spending, and borrowing policy each year to maximize GDP growth over a fixed term.

## Run locally

From the repo root:

```bash
npm start
```

Then open [http://localhost:4173/economy-sim/](http://localhost:4173/economy-sim/).

## Goal

Grow GDP as much as possible over eight years without letting debt, unemployment, inflation, or bond-market pressure get out of hand.

## Systems

- Annual policy choices for tax, spending, and borrowing
- Bond yields that worsen as debt and borrowing rise
- Unemployment as a second labor-market health signal
- Deterministic yearly shocks so runs stay testable
- Election checkpoints where low approval can end the game early
- Optional Supabase leaderboard for shared scores

## Supabase leaderboard setup

1. Create a Supabase project.
2. In the SQL editor, run the contents of [`supabase.sql`](/Users/michaeltrounce/Documents/New project/economy-sim/supabase.sql).
3. Open [`src/supabase-config.js`](/Users/michaeltrounce/Documents/New project/economy-sim/src/supabase-config.js).
4. Paste your Supabase project URL and anon key into:

```js
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
```

Supabase says browser clients are initialized with `createClient(supabaseUrl, supabaseKey)`, and public data access should be controlled with Row Level Security policies. Sources:
- [Supabase JS createClient](https://supabase.com/docs/reference/javascript/v1/initializing)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
