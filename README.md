# Sweet Vpn Spot

Cfg — a landing page that sells working VPN configs (VLESS, WireGuard, Shadowsocks, Outline). The site is available in 20 languages; Russian lives at `/` and every other language at `/<code>` (for example `/en`, `/de`).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sweet-vpn-spot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f49f08cf-28ea-4ee0-aee2-bed2858b3962).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? Use [Bun](https://bun.sh) — the repo ships a `bun.lock`
and `package.json` contains an `overrides` block that makes `npm install` fail
with `Cannot read properties of null (reading 'edgesOut')`.

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev        # http://localhost:8080
```

Quality gates:

```sh
bunx tsc --noEmit  # types
bun run lint       # eslint (includes prettier rules)
bun run test       # vitest
bun run build      # production build
bun run health     # uptime probe of SITE_URL (defaults to production)
```

`bun run health` checks that every public page answers 2xx **and** still
contains its expected markup (prices, terms copy), that no page fell back to the
error screen, and that the assets the home page references actually load.
Exit codes: `0` healthy, `1` outage, `2` degraded.

Probe a local build with:

```sh
SITE_URL=http://localhost:8080 bun run health
```

## Monitoring

There is no CI workflow in this repository (`.github/workflows` was removed on purpose),
so run the quality gates above before pushing. `bun run health` probes the live site, and
`monitoring/` contains optional SRE scripts (see `monitoring/README.md`).

## Stripe: paid Discord access

`POST /api/public/stripe-checkout` starts a Stripe Checkout Session and returns `{ url }`.
After payment Stripe redirects to `/success?session_id=…`, which shows "Success payment!"
and the Discord invite. `POST /api/public/stripe-webhook` records `checkout.session.completed`
(signature verified) and issues the invite once per session.

Setup:

1. Apply `drizzle/migrations/0001_stripe_payments.sql` to the database.
2. Create a one-time Price in Stripe and set the secrets below.
3. Add a webhook endpoint `https://<your-site>/api/public/stripe-webhook` for
   `checkout.session.completed` and copy its signing secret.

| Secret | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_…`) |
| `STRIPE_PRICE_ID` | One-time Price to sell (`price_…`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_…`) |
| `DISCORD_BOT_TOKEN`, `DISCORD_INVITE_CHANNEL_ID` | Optional: bot with Create Invite permission, issues a single-use 7-day invite per payment |
| `DISCORD_INVITE_URL` | Optional: permanent invite used when no bot is configured |
