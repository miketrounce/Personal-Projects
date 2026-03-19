# Lula

Live page:

[https://miketrounce.github.io/Tricksy/Lula/](https://miketrounce.github.io/Tricksy/Lula/)

A small browser game with two variants:
- `Politician`: control one economy directly and try to run it well over a fixed term
- `Trader`: run a macro hedge fund and make money trading bonds and FX as economies move
- `Daily Challenge`: one fixed scenario per day for everyone, with a built-in post-run breakdown

## Run locally

From the repo root:

```bash
npm start
```

Then open [http://localhost:4173/Tricksy/Lula/](http://localhost:4173/Tricksy/Lula/).

## Goal

Pick a country-inspired starting economy, then play through an eight year term.

- In `Politician`, grow GDP as much as possible without letting debt, unemployment, inflation, or bond-market pressure get out of hand.
- In `Trader`, let the world evolve on its own and try to make as much money as possible from simple bond and FX calls.

## Systems

- Country presets for Brazil, Indonesia, Serbia, and China
- Two playable variants with different objectives
- A daily challenge toggle that locks the run to the same scenario for everyone that day
- Annual policy choices for tax, spending, and borrowing in `Politician`
- Simple bond and currency positions in `Trader`
- Bond yields that worsen as debt and borrowing rise
- Unemployment as a second labor-market health signal
- Deterministic yearly shocks so runs stay testable
- Election checkpoints where low approval can end the game early
- Post-run analysis cards for best year, worst year, turning point, and risk
- Optional Supabase leaderboard for shared scores

## Supabase leaderboard setup

1. Create a Supabase project.
2. In the SQL editor, run the contents of [`supabase.sql`](/Users/michaeltrounce/Documents/New project/Tricksy/Lula/supabase.sql).
3. Open [`src/supabase-config.js`](/Users/michaeltrounce/Documents/New project/Tricksy/Lula/src/supabase-config.js).
4. Paste your Supabase project URL and anon key into:

```js
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
```

Supabase says browser clients are initialized with `createClient(supabaseUrl, supabaseKey)`, and public data access should be controlled with Row Level Security policies. Sources:
- [Supabase JS createClient](https://supabase.com/docs/reference/javascript/v1/initializing)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
