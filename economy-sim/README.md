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
