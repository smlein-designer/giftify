# Giftify — Tech Spec

_Last updated: 2026-07-01_

---

## Overview

Single-user web app. One person logs in, manages their data. All data is scoped to that user. No sharing, no multi-tenant complexity.

## Current Build State

Live on Supabase — auth and RLS are enabled, and `src/data/DataContext.jsx` reads and writes every table directly via `@supabase/supabase-js`. `src/data/seed.js` and `src/data/helpers.js` remain for reference/testing only.

---

## Auth

**Method:** Supabase Magic Link
- User enters email → receives a login link → clicks it → session created
- Session is stored by Supabase automatically
- All app routes except `/login` are protected — redirect to `/login` if no session

---

## Database (Supabase / PostgreSQL)

All tables include `user_id` tied to the logged-in user. Row Level Security (RLS) ensures users can only ever read and write their own data.

### Tables

#### `holidays`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → auth.users |
| name | text | e.g. "Christmas" |
| icon | text | Emoji or icon name |
| color | text | Hex color (optional) |
| date_logic | jsonb | `{type: "fixed", month: 12, day: 25}`, `{type: "calculated", rule: "easter"}`, `{type: "weekday", month, weekday (0 = Sun), nth (-1 = last), offset (days), label}`, or `{type: "table", key, label}` for lunar holidays (dates in `src/data/holidayDates.js`); see `holidayDateInYear` in `src/data/helpers.js` |
| is_system | boolean | True = pre-loaded, False = user-created |
| created_at | timestamptz | |

#### `recipients`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → auth.users |
| name | text | |
| emoji | text | Single emoji character |
| gift_prompt | text | Freeform personality / interests description |
| budget | text | Freeform, e.g. "$50–75" |
| group_tag | text | e.g. "Family", "Friends" |
| shipping_address | text | Optional |
| email | text | Optional |
| phone | text | Optional |
| created_at | timestamptz | |

#### `occasions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → auth.users |
| holiday_id | uuid | Foreign key → holidays (nullable — null for one-off occasions) |
| name | text | Auto-generated or user-overridden |
| date | date | Inferred from holiday or set manually |
| start_shopping_date | date | Optional |
| ship_date | date | Optional |
| notes | text | Optional |
| created_at | timestamptz | |

#### `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → auth.users |
| name | text | |
| link | text | URL to buy |
| description | text | Optional |
| price | numeric | Optional |
| photo_url | text | External URL or Supabase Storage URL |
| created_at | timestamptz | |

#### `gifts`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → auth.users |
| occasion_id | uuid | Foreign key → occasions (nullable) |
| name | text | Auto-generated or user-overridden |
| notes | text | Optional |
| reception_notes | text | How much they liked it — for AI context |
| type | text | `'physical'` or `'experience'` |
| physical_status | text | `idea → purchased → wrapped → shipped → received` |
| experience_status | text | `planned → confirmed → executed` |
| created_at | timestamptz | |

#### `gift_recipients` (junction)
| Column | Type | Notes |
|---|---|---|
| gift_id | uuid | Foreign key → gifts |
| recipient_id | uuid | Foreign key → recipients |

#### `gift_products` (junction)
| Column | Type | Notes |
|---|---|---|
| gift_id | uuid | Foreign key → gifts |
| product_id | uuid | Foreign key → products |

#### `holiday_recipients` (default recipients per holiday)
| Column | Type | Notes |
|---|---|---|
| holiday_id | uuid | Foreign key → holidays |
| recipient_id | uuid | Foreign key → recipients |

#### `holiday_products` (products that are good for a holiday)
| Column | Type | Notes |
|---|---|---|
| holiday_id | uuid | Foreign key → holidays |
| product_id | uuid | Foreign key → products |

### Derived / Calculated Values

These are not stored — they're calculated at query time:

| Value | How |
|---|---|
| Gift price total | Sum of `products.price` for all products linked via `gift_products` |
| Occasion total spend | Sum of gift price totals for all gifts on an occasion |
| Holiday average spend | Average of occasion total spends across all occasions for that holiday |
| Holiday total spend | Sum of all occasion total spends for that holiday |

### Row Level Security

Every table uses the same policy pattern:

```sql
-- Users can only access their own rows
USING (user_id = auth.uid())
```

Applied to SELECT, INSERT, UPDATE, DELETE on all tables.

---

## Storage (Supabase)

One bucket: `product-photos`
- Stores user-uploaded product photos
- Files named by product id: `{product_id}.jpg`
- Public read access (photos are displayed in the UI)
- Write access restricted to authenticated user

---

## Frontend Architecture

### Stack
- **Vite + React** — app scaffolding
- **React Router** — page routing
- **TanStack Query** — data fetching and caching
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **Supabase JS** — database and auth client

### Folder Structure

```
src/
  components/
    ui/              # Primitive components: Button, Input, Card, Tag, Badge
    layout/          # AppLayout, Nav, ProtectedRoute
    recipients/      # RecipientCard, RecipientForm
    products/        # ProductCard, ProductForm
    gifts/           # GiftCard, GiftForm
    occasions/       # OccasionCard, OccasionForm
    holidays/        # HolidayCard, HolidayForm
  pages/
    LoginPage
    OccasionsPage
    OccasionDetailPage
    RecipientsPage
    RecipientDetailPage
    ProductsPage
    ProductDetailPage
    HolidaysPage
    HolidayDetailPage
  hooks/
    useOccasions.js
    useRecipients.js
    useProducts.js
    useGifts.js
    useHolidays.js
  lib/
    supabase.js      # Supabase client instance
    claude.js        # Claude API call helpers
    ogFetch.js       # Open Graph photo fetching helper
  main.jsx
  App.jsx
```

### State Management

No global state library. Two layers only:
- **TanStack Query** — server state (data from Supabase)
- **React local state** — UI state (modals open/closed, form values)

---

## AI Integration (Claude API)

Three triggers. Each calls the Claude API with a constructed prompt.

### 1. Suggest products for a gift

**Trigger:** User clicks "Get suggestions" on a gift with no product yet.

**Prompt includes:**
- Recipient's name, gift prompt, budget
- Occasion name and date
- Products already in the user's library (as a list)
- Past gifts to this recipient (with reception notes if available)

**Response:** A ranked list of product suggestions — drawn from the library or new ideas.

### 2. Recommend products for a recipient or occasion

**Trigger:** User clicks "Get recommendations" on a recipient or occasion.

**Prompt includes:**
- Recipient's name, gift prompt, budget
- Occasion context if available
- Products already in the library

**Response:** A short list of curated suggestions with a brief reason for each.

### 3. Auto-create placeholder gifts

**Trigger:** User clicks "Auto-create gifts" on an occasion.

**Logic (no AI needed — system automation):**
1. Look up the occasion's parent holiday
2. Get all default recipients for that holiday (`holiday_recipients`)
3. For each recipient, create a gift row:
   - `name` = "[Recipient Name] — [Occasion Name]"
   - `occasion_id` = current occasion
   - `type` = null (not set yet)
   - `physical_status` = "idea"

---

## Photo Auto-Fetch

**Trigger:** User saves a product with a buy link.

**Flow:**
1. Frontend calls a Supabase Edge Function with the URL
2. Edge Function fetches the page and reads the `og:image` meta tag
3. Returns the image URL to the frontend
4. Frontend saves it to `products.photo_url`
5. If fetch fails or no OG image found → frontend prompts user to upload or paste an image URL

**Why an Edge Function:** Avoids CORS issues when scraping external URLs from the browser.

---

## System Automation: Auto-Create Occasions

**Trigger:** User adds a holiday to their account.

**Flow:**
1. Determine the holiday's date for the current year and the next 2 years
2. Insert 3 occasion rows:
   - `holiday_id` = the new holiday
   - `name` = "[Holiday Name] [Year]" (e.g. "Christmas 2026")
   - `date` = calculated from holiday's `date_logic`
3. Skip any year where an occasion already exists for this holiday

---

## Pre-loaded Holidays

The list lives in code, `src/data/holidayCatalog.js` (`HOLIDAY_CATALOG`). New accounts get Christmas and Easter on first sign-in (`STARTER_HOLIDAYS`). A unique index (`holidays_one_builtin_per_user` on `user_id, lower(name)` where `is_system`) plus a shared in-flight setup in `DataContext` stop a double first load (remount or two tabs) from adding them twice. The "Add a date" panel on /holidays lists every catalog holiday the user hasn't added; adding one inserts a `holidays` row with `is_system = true` and creates occasions for its next three upcoming dates (`occasionsForHoliday`).

Catalog: Lunar New Year, Eid al-Fitr, Diwali, Hanukkah (first candle evening) and Kwanzaa (Dec 26), Valentine's Day (Feb 14), Easter, Administrative Professionals Day (Wednesday of the last full week of April), Teacher Appreciation Day (Tuesday of the first full week of May), Mother's Day (2nd Sunday in May), Father's Day (3rd Sunday in June), Grandparents Day (Sunday after Labor Day), Boss's Day (Oct 16), Thanksgiving (4th Thursday in November), Christmas (Dec 25). Lunar-calendar holidays use `{type: "table", key, label}`; the dates live in `src/data/holidayDates.js` (sources noted there) so the list can be extended without touching stored rows. Diwali's table ends in 2030 and Eid's in 2033; add years before then.
- Halloween (Oct 31)
- New Year's Day (Jan 1)

User-created holidays (birthdays, etc.) have `is_system = false`.

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Stored in `.env.local` (never committed to git).

The Claude API key (`ANTHROPIC_API_KEY`) is not a client env var — it's set as a Supabase Edge Function secret and read server-side in `supabase/functions/suggest`, so it's never exposed to the browser.

---

## Open Questions

1. **Onboarding flow** — What does a brand new user see and do first? (Not yet designed.)
