# Giftify — Styleguide

_Last updated: 2026-05-16_

---

## Colors

| Role | Name | Hex |
|---|---|---|
| Background | Linen | `#FAFAFA` |
| Surface (cards, panels) | Warm Gray | `#F0F0EB` |
| Border | Soft Gray | `#DDD8D2` |
| Text — primary | Near Black | `#222220` |
| Text — muted | Warm Gray | `#6B6A66` |
| Accent | Rose | `#D4847A` |
| Accent — hover | Deep Rose | `#BE6D63` |
| Success | Sage | `#6A9E7F` |
| Error | Dusty Red | `#C0544A` |

**Guiding principle:** The background and surface colors are warm, not pure white or cool gray. The accent rose is used sparingly — for primary actions and key highlights only.

---

## Typography

**Font family:** DM Sans (Google Fonts)
**Weights used:** 400 (regular), 500 (medium), 700 (bold)

| Scale | Size | Weight | Use |
|---|---|---|---|
| `xs` | 12px | 400 | Labels, timestamps, secondary metadata |
| `sm` | 14px | 400 | Body text, list items |
| `base` | 16px | 400 | Default body |
| `lg` | 18px | 500 | Section subheadings |
| `xl` | 20px | 700 | Card titles, object names |
| `2xl` | 24px | 700 | Page headings |
| `3xl` | 30px | 700 | Hero / primary screen title |

**Guiding principle:** One font, two roles — light weight for reading, bold for hierarchy. No decorative fonts.

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `sm` | 4px | Inputs, tags, badges |
| `md` | 6px | Cards, buttons, panels |
| `lg` | 10px | Modals, drawers, large containers |
| `full` | 9999px | Pills, avatars, icon buttons |

**Guiding principle:** Corners are subtle — present but not a design statement.

---

## Spacing

Based on a 4px base unit. Key values:

| Token | Value | Use |
|---|---|---|
| `1` | 4px | Tight internal spacing |
| `2` | 8px | Between inline elements |
| `3` | 12px | Internal card padding (compact) |
| `4` | 16px | Standard internal padding |
| `6` | 24px | Between card sections |
| `8` | 32px | Between major page sections |
| `12` | 48px | Page-level vertical rhythm |

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `sm` | `0 1px 3px rgba(0,0,0,0.07)` | Subtle card lift |
| `md` | `0 4px 12px rgba(0,0,0,0.09)` | Modals, dropdowns |
| `none` | — | Flat elements on surface backgrounds |

**Guiding principle:** Shadows are very soft. Most cards sit on a warm surface and need no shadow — use `sm` only when a card needs to float above a background.

---

## Components

### Buttons

| Variant | Background | Text | Use |
|---|---|---|---|
| Primary | `#D4847A` | White | Main action per screen |
| Secondary | `#F0F0EB` | `#222220` | Supporting actions |
| Ghost | Transparent | `#6B6A66` | Tertiary / destructive actions |

- Padding: `12px 20px`
- Border radius: `6px` (md)
- Font: DM Sans, 500, 14px
- One primary button per screen maximum

### Inputs

- Background: White (`#FFFFFF`)
- Border: `1px solid #DDD8D2`
- Border radius: `4px` (sm)
- Focus ring: `2px solid #D4847A`
- Padding: `10px 14px`
- Font: DM Sans, 400, 14px
- Placeholder text: `#6B6A66`

### Cards

- Background: `#F0F0EB` (surface)
- Border: `1px solid #DDD8D2`
- Border radius: `6px` (md)
- Padding: `16px`
- Shadow: `sm` or none depending on context

### Tags / Badges

- Background: `#F0F0EB`
- Border: `1px solid #DDD8D2`
- Border radius: `4px` (sm)
- Font: DM Sans, 400, 12px
- Padding: `2px 8px`

---

## Iconography

- Use a single icon library throughout — **Lucide** (clean, minimal, consistent stroke weight)
- Icon size: 16px inline, 20px standalone
- Color: matches text context (`#222220` or `#6B6A66`)
- No filled icons — stroke only

---

## Guiding Principles

1. **Warm, not stark.** Nothing is pure white or pure black. Everything has a slight warmth.
2. **Restrained accent.** Rose appears on one primary action per screen. Not on decorative elements.
3. **Space is the design.** Generous padding and whitespace do the heavy lifting. Resist adding visual elements to fill gaps.
4. **No drop shadows on flat surfaces.** Cards on the warm surface background don't need elevation — they're defined by their border alone.
