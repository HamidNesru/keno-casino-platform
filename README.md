# KenoPlay Casino Demo — Supabase Ready

Virtual-credit demo platform. No deposits, withdrawals, or cash value.

## What changed
- Mobile-first Keno layout based on the supplied reference image.
- 60-second countdown above the 80-number board.
- At 00:00, 20 Keno results appear one by one in the result panel.
- Selected numbers and other-player popularity indicators.
- Animated Aviator take-off/flight/crash-style presentation.
- Animated Dice, Roulette and Slots rounds.
- Player registration/login by phone + password.
- Admin login by email + password.
- Supabase profiles, game rounds, and admin credit adjustments.
- Local demo fallback when Supabase environment variables are absent.

## Supabase setup
1. Create a Supabase project.
2. In SQL Editor, run `supabase-schema.sql`.
3. In Authentication > Providers, enable Phone if you want phone authentication.
4. Create an admin email/password account in Authentication.
5. After the account exists, run:
   `update public.profiles set role='admin' where id = (select id from auth.users where email='YOUR_ADMIN_EMAIL');`
6. Copy `.env.example` to `.env` and fill in:
   `VITE_SUPABASE_URL=...`
   `VITE_SUPABASE_ANON_KEY=...`
7. Run `npm install` then `npm run dev`.

## Important
The UI and virtual-credit flows are a demo. For a production game, random results and credit settlement must run in trusted server-side/Edge Function code rather than accepting a payout value from the browser.
