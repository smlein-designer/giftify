# Giftify: Styleguide

_Last updated: 2026-11-17 (visual redesign: "Midnight & Marigold")_

---

## Direction

Giftify's core user gives a lot of gifts, all year: birthdays, anniversaries, Mother's Day, showers, graduations and the winter holidays. She already lives with considered brands. The app should feel like a premium personal planner: calm, confident, crisp.

- **Year-round, never seasonal.** No red/green, no ribbons-as-decoration, nothing that reads as one holiday.
- **Quiet luxury, not "for women" clichés.** No blush-pink washes, script fonts or florals.
- **Its own look.** An earlier ivory-and-terracotta pass read too close to Claude's brand; cool white, midnight navy and marigold are deliberately distinct.
- **People-first.** Recipients have their own color identity and feel like people, not rows.
- **Calm urgency.** Time pressure is shown with amber and clear countdowns, not alarm red.
- **Comfortable to read.** 15px base text, AA contrast, 40px+ touch targets.

---

## Colors

| Token (Tailwind) | Hex | Use |
|---|---|---|
| `paper` | `#F4F5F9` | Page background (cool white) |
| `card` | `#FFFFFF` | Cards, inputs, sheet contents |
| `sand` | `#E8EAF2` | Quiet fills, placeholders, counters |
| `line` | `#DDE0EA` | Hairlines, card borders |
| `line-strong` | `#C3C8D8` | Input and chip borders |
| `ink` | `#151C3B` | Primary text, primary buttons, hero card (midnight navy) |
| `ink-hover` | `#212A52` | Primary button hover |
| `ink-soft` | `#474F6D` | Secondary text |
| `ink-faint` | `#5A6280` | Tertiary text and icons (5.5:1 on paper) |
| `marigold` | `#F2B33D` | Accent on dark surfaces only: hero, active nav icon, logo bow, "Time to shop" on the hero |
| `amber` | `#9A5200` | Time pressure on light surfaces, month labels, eyebrows |
| `amber-deep` / `amber-tint` | `#7A4100` / `#FCEFD2` | Accent tag text / fill |
| `sage` / `sage-tint` | `#2C6E55` / `#DBEEE5` | Done, received, reception notes |
| `ochre` / `ochre-tint` | `#7A5612` / `#F4E8CC` | Warnings |
| `focus` | `#E1E6F8` | Focus halo, text selection |
| `danger` | `#A8362A` | Destructive actions, errors |

**Marigold never carries text on light backgrounds** (too low contrast); use `amber` there.

**Avatar / tile tints.** People, dates and photo-less products get a stable tint from `src/lib/tint.js` (marigold, green, periwinkle, ochre, teal, rose), chosen by hashing the name. Always use `tintFor(name)`, never pick by hand.

Legacy token names (`background`, `surface`, `border`, `foreground`, `muted`, `accent`, `success`, `error`) are aliased to the new palette so older class names stay on-brand. Prefer the new names.

---

## Typography

Fonts are self-hosted via Fontsource (imported in `src/main.jsx`), no Google Fonts request.

| Role | Font | Tailwind |
|---|---|---|
| Display, headings, names, numbers | **Syne** (variable), 600 / 700 | `font-display` (auto on h1 to h3) |
| Body, UI | **Hanken Grotesk** (variable), 400 / 500 / 600 | `font-sans` (default) |

| Use | Size / weight |
|---|---|
| Page title | 32px mobile, 40px desktop, Syne 600, leading 1.05 |
| Detail title | 30px / 36px, Syne 600 |
| Hero countdown | 72px / 104px, Syne 700, tabular |
| Section heading | 17px Syne 600 + count pill |
| Card title | 15 to 19px Syne 600 |
| Body | 15px Hanken 400, line-height 1.55 |
| Meta | 13px Hanken |
| Eyebrow (`.eyebrow`) | 12px Hanken 500, `ink-faint`, sentence case |

No all-caps tracked labels. Large Syne numerals (countdowns, calendar days, totals) use `tracking-numeral` (-0.075em) so the digits nearly touch; use proportional figures there. Mixed text like "Nov 15" uses -0.03em instead. Use `tabular` only for small numbers that line up in columns.

---

## Shape, depth, motion

| Token | Value | Use |
|---|---|---|
| `rounded-md` | 12px | Inputs, small tiles |
| `rounded-lg` | 16px | Photo frames |
| `rounded-xl` | 20px | Cards, list groups |
| `rounded-2xl` | 24px | Hero, sheets, product images |
| `rounded-full` | | Buttons, chips, tags, avatars, nav items |
| `shadow-paper` | soft lift | Card hover |
| `shadow-lift` | deeper | Hero card |
| `shadow-sheet` | left cast | Slide-over sheets |

Motion: pages `animate-rise` (6px, 260ms), sheets `animate-sheet-in`, backdrops `animate-fade-in`. Card links lift 1px on hover.

---

## Layout

- **Desktop (md+):** fixed 256px left sidebar (logo, nav, note card, sign out). Content column max 880px.
- **Mobile:** slim sticky top bar (logo, sign out) and a fixed bottom tab bar with 4 tabs. Content gets `pb-28` so nothing hides behind the tabs.
- **Nav labels:** Occasions, People, Gift library, Dates (routes unchanged).
- **Page header:** amber eyebrow, large Syne title, one-line description, actions right (stack on mobile).

---

## Components

| Component | File | Notes |
|---|---|---|
| Button | `ui/Button.jsx` | Pill. Variants `primary` (ink), `secondary` (card + border), `ghost`, `danger`. Sizes `md` 44px, `sm` 36px, `icon` 40px. |
| Tag | `ui/Tag.jsx` | Pill, 24px. `default`, `accent`, `success`, `warning`, `outline`. |
| Avatar / AvatarStack | `ui/Avatar.jsx` | Emoji in a tinted disc; stacks overlap with a card-colored ring. |
| IconTile | `ui/IconTile.jsx` | Emoji in a tinted rounded square (dates, occasions). |
| Progress | `ui/Progress.jsx` | 6px bar; turns sage when complete; `tone="light"` for the dark hero. |
| StatusStepper | `ui/StatusStepper.jsx` | Gift status track: done = ink check, current = amber dot, complete = sage. |
| PageHeader, SectionHeader, BackLink, EmptyState | `ui/PageHeader.jsx` | Shared page scaffolding. |
| SlidePanel | `ui/SlidePanel.jsx` | Right sheet, portaled to body, Esc to close, full-screen on mobile. |
| Logo / LogoMark | `ui/Logo.jsx` | "The bow": a marigold (`#F2B33D`) bow on a midnight ink tile, 14/64 corner radius; `tile={false}` drops the tile on dark grounds. Wordmark: Syne Bold, -0.02em. Also `public/favicon.svg`. Keep the bow marigold; never place it directly on a light background without the tile. |

**Form classes** (in `src/index.css`): `.field-label`, `.field` (44px input/select), `.field-area` (textarea), `.chip` / `.chip-on` (toggle pills). Focus = ink border + `focus` halo.

**Lists:** related rows sit in one `.card` with `divide-y divide-line`, not as separate boxes. Occasions show a date block (amber month over Syne day).

---

## Iconography

Lucide, stroke only, `strokeWidth={1.75}` for UI, `1.5` for glyphs inside avatars and tiles.

**No emoji in the UI.** Emoji stay in the database (`recipient.emoji`, `holiday.icon`) for compatibility, but `src/lib/glyph.jsx` turns them into:
- **People:** a Syne monogram (first initial) in a tinted disc.
- **Pets and babies:** a fine line icon (dog, cat, rabbit, bird, fish, small pet, paw, baby).
- **Dates:** a fine line icon (cake, glass, heart, flowers, cap, ring, tree, snowflake, egg, star, moon, clover, autumn, party, gift). Unrecognized emoji fall back to a keyword match on the name, then a monogram.

The recipient and date forms offer these as visual pickers instead of free emoji entry.

---

## States and feedback

| Situation | Pattern | Where |
|---|---|---|
| Save or delete succeeded | Ink toast with sage check, 3.5s, after the database confirms | `ui/Toast.jsx`, `success` option on every data mutation |
| Save or delete failed | Screen reverts to before the change; ink toast with marigold alert explains, 8s | `persist()` in `DataContext.jsx` |
| Destructive action | Styled confirm dialog stating what will be lost (counts), focus starts on "Keep it" | `ui/ConfirmDialog.jsx`, `useConfirm()` |
| Form error | Red border + message under the field, focus jumps to the first error, no browser bubbles (`noValidate`) | `ui/Field.jsx` |
| Submitting | Button reads "Saving…" and is disabled; double-submit ignored | each form |
| Data can't load | Full-page "We couldn't load your planner" with Try again | `ui/LoadError.jsx` |
| Missing record or bad URL | "We couldn't find that…" empty state with a way back | `NotFound` in `ui/PageHeader.jsx` |
| Empty list | Dashed EmptyState with a sentence on what to do next | `EmptyState` |
| AI thinking | Skeleton cards + "Thinking about what they'd love…" | `ui/SuggestionsPanel.jsx` |

**Accessibility:** every field has a real label; errors are linked to their field; sheets and dialogs trap focus, close on Escape and return focus to what opened them; motion is switched off when the system "reduce motion" setting is on; text colors meet WCAG AA.

## Rules

1. **One primary (ink) button per screen.** Everything else is secondary, ghost or a link.
2. **Amber means "time".** Use it for countdowns, shop-by states and eyebrows, not decoration.
3. **Green (`sage`) means "done".** Received gifts, completed progress, reception notes.
4. **Group, don't box.** Put related rows in one card with dividers.
5. **Numbers are display type.** Countdowns, dates and totals use Syne and tabular figures.
