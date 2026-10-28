# Sweet Vpn Spot

Создай весь веб-сайт как у projectreal.gg но только вся тема: про config vpn дизайн в точь в точь всё в точь в точь, вот ДС ссылка ну чтобы присоединялись: https://discord.gg/6DsXVJkEJw

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
