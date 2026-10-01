# Casino Demo Platform — Virtual Credits

This project is a mobile-first React/Vite demo casino-style platform. It contains:

- Keno (1–80, up to 10 picks, draw animation, payout table, other-player simulated picks)
- Aviator-style multiplier demo
- Dice
- Roulette
- Slots
- Player virtual-credit balance
- Local admin dashboard to add/deduct virtual credits
- Player list, platform statistics, game history
- Local persistence with `localStorage`
- Responsive phone and desktop layouts

## Important

This build is **virtual-credit only**. It has no deposits, withdrawals, cash-out, payment processing, or real-money value.

The admin screen is intentionally a **local demo admin**. Because the data is stored in the browser, it is not a secure production administration system.

## Run

1. Install Node.js 20+.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open the Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## How to test

- Start on the Games screen.
- Keno is the first game. Select up to 10 numbers, choose a stake, and press BET.
- Use the other game buttons to test Aviator, Dice, Roulette and Slots.
- Open **Admin** in the top bar to add or deduct virtual credits from the demo players.
- The Reset demo data button restores the original players and balances.

## Production next step

For a real multi-user deployment, replace the localStorage store with a server-side database such as Supabase, add authentication and Row Level Security, and move all balance-changing and game-result logic to trusted server/edge functions. Do not trust browser-side credit balances or game results.
