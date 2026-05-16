# Giftify

A personal gift-giving planning app for a single user. Tracks recipients, a product library, occasions, and gift history — with AI-powered recommendations.

## Key Docs

- [PRD.md](PRD.md) — objects, attributes, relationships, automation, build phases, open questions
- [TECHSPEC.md](TECHSPEC.md) — database schema, frontend architecture, AI integration, automations
- [STYLEGUIDE.md](STYLEGUIDE.md) — colors, typography, spacing, component specs
- [styleguide.html](styleguide.html) — visual reference, open in browser

## Tech Stack

- **Frontend:** Vite + React
- **Styling:** Tailwind CSS
- **Database & Auth & Storage:** Supabase
- **AI:** Claude API
- **Hosting:** Vercel

## Auth

Magic link via Supabase Auth. User enters their email, receives a login link. No password.

## Core Objects

Five objects. See PRD.md for full detail.

| Object | Description |
|---|---|
| RECIPIENT | Person or pet you give gifts to |
| PRODUCT | Saved gift item in your library |
| GIFT | A product given to a recipient for an occasion (junction object) |
| OCCASION | A specific instance of a holiday in a year (e.g. Christmas 2026) |
| HOLIDAY | Template for occasions — pre-loaded or user-created |

## Navigation & Routes

Home defaults to Occasions (upcoming). Four top-level sections:

| Route | Section |
|---|---|
| `/` | Occasions — upcoming and past |
| `/occasions/:id` | Occasion detail |
| `/recipients` | Recipients list |
| `/recipients/:id` | Recipient detail |
| `/products` | Products list |
| `/products/:id` | Product detail |
| `/holidays` | Holidays list |
| `/holidays/:id` | Holiday detail |
| `/login` | Magic link login |

## Phase 1 Scope

Build these and nothing else until Phase 1 is complete:

- RECIPIENT: name, emoji, group/tag, gift-giving prompt, budget, CRUD
- PRODUCT: name, link, description, price, photo (auto-fetch or upload), CRUD
- GIFT: auto-named, type, status tracking, notes, notes on reception, CRUD
- OCCASION: auto-named, date, start shopping date, ship date, total spend, CRUD
- HOLIDAY: name, icon, date logic, default recipients, add from system list, create custom
- Auto-create occasions (3 years out) when a holiday is added
- Auto-create placeholder gifts when user requests it on an occasion
- AI product suggestions on gifts and recipients

## Design Tokens

Full specs in STYLEGUIDE.md. Key values:

| Token | Value |
|---|---|
| Background | `#FAFAFA` |
| Surface | `#F0F0EB` |
| Border | `#DDD8D2` |
| Text | `#222220` |
| Muted text | `#6B6A66` |
| Accent | `#D4847A` |
| Accent hover | `#BE6D63` |
| Success | `#6A9E7F` |
| Error | `#C0544A` |
| Font | DM Sans (Google Fonts) — weights 400, 500, 700 |
| Border radius | 4px (sm) · 6px (md) · 10px (lg) |
| Icons | Lucide — stroke only |

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ANTHROPIC_API_KEY=
```

## Current Build State

Building with local mock data — no Supabase yet. Data lives in `src/data/seed.js`, helpers in `src/data/helpers.js`. Auth and Supabase come after the UI is solid.

## Instructions

- Update PRD.md, STYLEGUIDE.md, and this file as decisions are made
- Don't build features outside Phase 1 scope unless explicitly asked
- When in doubt about a design decision, refer to STYLEGUIDE.md
- One primary button (accent rose) per screen maximum
