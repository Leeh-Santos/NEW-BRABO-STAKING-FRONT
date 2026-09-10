# Brabo Staking

Staking interface for `BraboStaking.sol` on Base, with NFT tier bonuses.

Vite + React 19 + TypeScript, wagmi v2 / viem v2 / RainbowKit v2, styled on the
shared Brabo ecosystem design system.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_WALLETCONNECT_PROJECT_ID` | For WalletConnect/QR | Free at [cloud.reown.com](https://cloud.reown.com). Injected wallets (MetaMask, Coinbase, Phantom) work without it; QR connections do not. |
| `VITE_BASE_RPC_URL` | No | Defaults to `https://mainnet.base.org`. A dedicated RPC is recommended for production — the public endpoint rate-limits. |

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on :5173 |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint over `src` |

## Layout

```
src/
  config/     contracts.ts (addresses + ABIs), wagmi.ts, env.ts
  hooks/      useStakingData (reads), useStakingActions (writes),
              useStakingPageAnimations, useSmoothScroll
  lib/        formatters.ts, errors.ts, tierArt.ts, countup.ts
  components/ layout/ (navbar, ticker, section nav, shell)
              ui/ (stat card, market field, toast, tx overlay, error boundary)
              stats/ staking/ info/ contracts/
  pages/      StakingPage.tsx
  styles/     tokens.css, fonts.css, background.css
  index.css   the interface stylesheet
```

## Design system

Ported from Brabo Markets (`reference-brabo-ux/`) so the two products read as one
family: identity from the bull (navy ground, gold horns); structure from
morpho.org — depth comes from hairline borders on flat fills, never shadows or
gradients; one accent colour used sparingly; wide Archivo display type; every
figure in JetBrains Mono, tabular.

**Where Staking diverges from Markets** — deliberately, and only here:

| | Markets | Staking |
| --- | --- | --- |
| Action colour | cyan `#38c0f8` (the bull's eyes) | mint `#2fd4b6` (`--accent`) |
| Success green | `#34d399` | `#4ade80` — pushed 26° away so it doesn't read as the mint |
| Backdrop | candlestick field | accrual curve (`AccrualField`) |

Everything else — layout, spacing, type, grids, the shell, the horn cut, and
gold-means-earned — is shared and should stay shared. The accent token is named
`--accent`, not `--mint`, because the slot is the product's own; don't hard-code
the hex anywhere but `tokens.css` (`App.tsx` mirrors it once for RainbowKit's
own modal theme, which cannot read CSS variables).

Markets stands on a candlestick field because it is a trading product. Staking
does not trade — nothing here ticks up and down against you, it accrues — so the
same floor is drawn as one rising curve with the area filled beneath it, in mint
only, with no red bar.

Two conventions are load-bearing and easy to break:

- **Shared-edge grids.** `.stats-grid`, `.cards-grid`, `.tier-cards-grid` and the
  rest use `gap: 1px` over a `--hair` background, so the gap itself draws the
  dividers. A track with no card in it is therefore not empty — it is a slab of
  divider colour. Keep column counts a divisor of the item count, and size tracks
  with `minmax(0, 1fr)`: a bare `1fr` is `minmax(auto, 1fr)`, whose min-content
  floor pushes panels past the viewport on phones.
- **Gold means earned, cyan means actionable.** Gold is never used on anything
  clickable; cyan is never used for decoration.

`legacy-site/` is the pre-migration vanilla build. `reference-brabo/` and
`reference-brabo-ux/` are the sister project's code and design reference. None of
the three ship in the build.

## Dependency notes

- **wagmi is pinned to 2.x on purpose.** RainbowKit 2.2.11 declares
  `wagmi ^2.9.0`; a bare `npm install wagmi` pulls v3 and breaks the peer.
  Re-check before bumping.
- `react-countup` is imported through `src/lib/countup.ts`, which unwraps a
  double-wrapped CJS default (`mod.default ?? mod`). Import it from there, not
  directly.
- Chunk-size warnings on build come from RainbowKit's bundled wallet SDKs and are
  expected.
