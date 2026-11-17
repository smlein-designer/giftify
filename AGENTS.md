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
- **AI:** Codex API
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

Visual direction: **"Midnight & Marigold"** (redesigned 2026-11-17). Year-round, calm, premium; built for people who give a lot of gifts, and deliberately distinct from Claude's own cream-and-clay look. Full specs in STYLEGUIDE.md; tokens live in `tailwind.config.js`. Key values:

| Token | Value |
|---|---|
| `paper` (background) | `#F4F5F9` |
| `card` (surfaces) | `#FFFFFF` |
| `sand` (quiet fills) | `#E8EAF2` |
| `line` / `line-strong` | `#DDE0EA` / `#C3C8D8` |
| `ink` (text, primary button, hero) | `#151C3B` |
| `ink-soft` / `ink-faint` | `#474F6D` / `#5A6280` |
| `marigold` (accent on dark only) | `#F2B33D` |
| `amber` (time pressure on light) | `#9A5200` |
| `sage` (done) | `#2C6E55` |
| Fonts | Syne (display, `font-display`) + Hanken Grotesk (body), self-hosted via Fontsource |
| Radius | 12px inputs · 20px cards · 24px hero/sheets · pills for buttons, chips, tags |
| Icons | Lucide, stroke only, strokeWidth 1.75; emoji stored as data render as line icons or monograms (`src/lib/glyph.jsx`) |
| Logo | "The bow": marigold bow on a midnight tile (`src/components/ui/Logo.jsx`, `public/favicon.svg`) |

Layout: desktop left sidebar, mobile top bar + bottom tab bar. Shared UI lives in `src/components/ui/` (Avatar, IconTile, PageHeader, Progress, StatusStepper, SlidePanel, Toast, ConfirmDialog, Field, Logo). Form styles are `.field`, `.field-area`, `.field-label`, `.chip` in `src/index.css`. Every data mutation reports success/failure via toasts and rolls back on error (`persist()` in DataContext).

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Claude API key (`ANTHROPIC_API_KEY`) is a Supabase Edge Function secret, not a client env var — see TECHSPEC.md.

## Current Build State

Live on Supabase — auth, database, and RLS are wired up and in use across all tables. `src/data/DataContext.jsx` reads and writes via Supabase directly. `src/data/seed.js` remains for reference/testing only.

## Instructions

- Update PRD.md, STYLEGUIDE.md, and this file as decisions are made
- Don't build features outside Phase 1 scope unless explicitly asked
- When in doubt about a design decision, refer to STYLEGUIDE.md
- One primary button (ink) per screen maximum
