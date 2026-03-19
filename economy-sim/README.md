# Economy Sim

Live page:

[https://miketrounce.github.io/Personal-Projects/economy-sim/](https://miketrounce.github.io/Personal-Projects/economy-sim/)

A small browser game with two play styles:
- `President Mode`: set tax, spending, and borrowing policy each year to maximize GDP growth over a fixed term
- `Trader Mode`: react to the same economy by trading bonds and currencies for profit
- `Daily Challenge`: one fixed scenario per day for everyone, with a built-in post-run breakdown

## Run locally

From the repo root:

```bash
npm start
```

Then open [http://localhost:4173/economy-sim/](http://localhost:4173/economy-sim/).

## Goal

Pick a country-inspired starting economy, then play through an eight year term.

- In `President Mode`, grow GDP as much as possible without letting debt, unemployment, inflation, or bond-market pressure get out of hand.
- In `Trader Mode`, let the world evolve on its own and try to make as much money as possible from simple bond and FX calls.

## Systems

- Country presets for Brazil, Indonesia, Serbia, and China
- Two player modes with different objectives
- A daily challenge toggle that locks the run to the same scenario for everyone that day
- Annual policy choices for tax, spending, and borrowing in `President Mode`
- Simple bond and currency positions in `Trader Mode`
- Bond yields that worsen as debt and borrowing rise
- Unemployment as a second labor-market health signal
- Deterministic yearly shocks so runs stay testable
- Election checkpoints where low approval can end the game early
- Post-run analysis cards for best year, worst year, turning point, and risk
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
