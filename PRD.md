# Giftify — Product Requirements Document

_Last updated: 2026-05-16_

---

## Overview

Giftify is a personal gift-giving planning app. It helps you track the people you give to, build a library of go-to gift products, plan for upcoming holidays, and look back at your gift-giving history — all with AI that learns your preferences and makes smart suggestions over time.

---

## Who It's For

A single user (you). This is a personal, private tool — not a social or shared app. You are the gift-giver. The app helps you be more thoughtful, organized, and less stressed about gift giving.

## Home View

The app opens to **Upcoming Occasions** — a chronological view of what's coming up and what needs attention.

---

## Core Objects

These are the five things the app knows about. Everything in the app revolves around them.

---

### RECIPIENT
> Someone you give gifts to. Can be a person or a pet.

**Examples:** Luke, Mom, Lucky (a dog), Arden

**Core data:**
- Name
- Emoji (a quick visual identifier)
- Gift-giving prompt — a freeform description of this recipient: their personality, interests, and the kinds of things they like. This feeds the AI.
- Budget — a separate field for how much you typically like to spend on this recipient.

**Metadata:**
- Group / Tag — used to cluster recipients (e.g., "Family", "Book Club"). When gifting a tagged group, the user selects one delivery method from within the group: a shipping address, email address, or phone number pulled from the tagged recipients' profiles.

**Relationships:**
- Has many **Gifts** (given or planned for them)
- Has many **Occasions** (coming up and past)
- Has specific **Holidays** (like their birthday, auto-created for the next 3 years)
- Has many **Products** recommended for them
- Can be grouped with other **Recipients** at the same address (for shared shipping)

**What the user can do:** Create, view, edit, delete a recipient. Create a one-off Occasion directly from a recipient's profile (not tied to any Holiday).

---

### PRODUCT
> A gift item you love and want to keep on hand as a reusable option.

**Examples:** Rocker Garlic Press, 4000 Weeks (book), Play Silks, Large Magnetic Calendar, Picnic in the Woods (experience)

**Core data:**
- Name
- Link to buy
- Description
- Photo — auto-pulled from the buy link when possible. If unavailable, user can upload a photo or paste a direct image link.

**Metadata:**
- Price
- Tags — user-generated labels like "Made in USA", "Kids", "Under $50" _(Future phase)_

**Relationships:**
- Can be given as many **Gifts**
- Can be recommended for specific **Recipients**
- Is good for certain **Holidays**
- Has similar **Products** (AI-inferred, not user-curated)

**What the user can do:** Create, view, edit, delete a product.

**What the AI can do:** Recommend a product for a specific recipient or occasion.

---

### GIFT
> A specific product (or idea) given to a specific recipient, for a specific occasion. This is the junction between everything.

**Examples:** "4000 Weeks for Dad", "Play Silks for Arden — Christmas 2026"

**Core data:**
- Name — auto-generated from context; user can override. Two cases:
  - With a product: "[Product] for [Recipient]" (e.g., "4000 Weeks for Dad")
  - Placeholder (no product yet): "[Occasion] gift for [Recipient]", using the holiday name, or a one-off occasion's name without the year (e.g., "Christmas gift for Mom", "Graduation party gift for Arden")
  - Two products: "Apron and mixing bowls for Mom"; three or more: "Apron + 2 more for Mom"; several recipients: "Christmas gift for Ann and Luke"
  - The name follows the gift's people and products until the user types their own; clearing the field returns it to automatic (built Nov 2026)
- Notes — freeform notes about this specific gift
- Notes on how much they liked it — used to improve future AI recommendations

**Metadata:**
- Type: Physical or Experience
- Status (if Physical): Idea → Purchased → Wrapped → Shipped → Received
- Status (if Experience): Planned → Confirmed → Executed
- Star rating _(Future phase)_
- Price total — calculated from the prices of all products attached to this gift. A gift can include multiple products.

**Relationships:**
- Linked to one or more **Products** (optional — a gift can be product-less for fully custom one-offs)
- Given to one or more **Recipients** (usually one, but can be a couple or whole family)
- Given for one **Occasion** (optional — can exist outside an occasion)
- Has AI-suggested **Products** that might be good for it

**What the user can do:** Create, view, edit, delete a gift. Request auto-creation of placeholder gifts for an occasion.

**What the AI can do:** Suggest products for a gift that doesn't have one yet.

**What the system does automatically:** Create placeholder gifts when an occasion is set up.

---

### OCCASION
> A specific instance of a holiday in a specific year. This is where the actual gift planning happens.

**Examples:** Christmas 2026, Mom's Birthday 2025, Easter 2027

**Core data:**
- Name — auto-generated as "[Holiday] [Year]"; user can override
- Notes

**Metadata:**
- Date — inferred from the holiday, but editable (e.g., family celebrating Christmas on Dec 26th)
- Start Shopping Date — a reminder of when to begin
- Ship Date — when gifts need to be sent
- Total Spend — sum of all gift prices for this occasion

**Relationships:**
- Belongs to one **Holiday** (its template) — can be zero for one-off occasions like a graduation
- Has many **Gifts** (can be filtered by status)
- Has many **Recipients** being gifted
- Has many suggested **Products** good for it
- Related to other **Occasions** from the same holiday (past Christmases, future ones)

**What the user can do:** Create, edit, delete an occasion.

**What the system does automatically:** Create occasions for the next 3 years whenever a new holiday is added.

---

### HOLIDAY
> The template that occasions are based on. A curated set of common gift-giving holidays and recurring events comes pre-loaded; users can also create their own (especially birthdays).

**Examples:** Christmas, Hanukkah, Easter, Mother's Day, Father's Day, Valentine's Day, Thanksgiving, Halloween, New Year's — plus user-created ones like Mom's Birthday, Luke's Birthday, Summer Solstice

**Core data:**
- Name
- Icon
- Color (optional theming)

**Metadata:**
- Date / Date Logic — fixed dates (Christmas = Dec 25), Easter, or weekday rules (Mother's Day = second Sunday in May). Pre-loaded list lives in `src/data/holidayCatalog.js`: Lunar New Year, Eid al-Fitr, Diwali, Hanukkah, Kwanzaa, Valentine's Day, Easter, Administrative Professionals Day, Teacher Appreciation Day, Mother's Day, Father's Day, Grandparents Day, Boss's Day, Thanksgiving, Christmas. New accounts start with Christmas and Easter; the rest are added from the "Add a date" panel (built Nov 2026). Lunar-calendar holidays use looked-up date tables in `src/data/holidayDates.js` (Hanukkah and Lunar New Year through 2035, Eid al-Fitr through 2033, Diwali through 2030); extend them as years pass.
- Rollup: Average Spend — average total spent across all past occasions for this holiday
- Total Spend — lifetime total across all occasions for this holiday

**Relationships:**
- Has many **Occasions** (past and future)
- Has default **Recipients** (people you always buy for on this holiday)
- Has many good-fit **Products**
- Has many **Gifts** (by proxy through occasions)

**What the user can do:** Add a pre-loaded holiday to their account, or create a custom one (like a birthday). Edit and delete.

---

## Automation & AI

These are the smart behaviors that make the app feel effortless.

### System Automations (happen without user action)

| Trigger | What Happens |
|---|---|
| User adds a Holiday | System creates Occasions for the next 3 years automatically |
| Gift is created | Name is auto-generated based on context (see GIFT above) |
| Occasion is created | Name is auto-generated as "[Holiday] [Year]"; date is pulled from Holiday's date logic |
| Product has a buy link | Photo is auto-fetched from that URL |

### AI Features

| Trigger | Where | What the AI Does |
|---|---|---|
| User requests "Auto-create gifts" on an Occasion | Occasion | AI looks at the Holiday's default Recipients and creates placeholder Gifts for each one |
| User asks for product recommendations | On a Recipient or Occasion | AI suggests Products based on the recipient's gift-giving prompt and the occasion context |
| User asks for suggestions on a Gift | On a Gift | AI suggests Products from the library (or new ideas) that would work for this specific gift |
| User adds a Product | On a Product | AI infers similar Products and surfaces them |


---

## Relationships Summary

```
HOLIDAY
  └── has many OCCASIONS (auto-created 3 years out)
       └── has many GIFTS (planned or given)
            ├── linked to 0+ PRODUCTS (optional)
            └── given to 1+ RECIPIENTS

RECIPIENT
  ├── has specific HOLIDAYS (their birthday, etc.)
  ├── has many OCCASIONS
  └── has many GIFTS

PRODUCT
  ├── can become many GIFTS
  └── is good for certain HOLIDAYS
```

---

## Build Phases

### Phase 1 — Beta / Core Build
The essential functionality. Everything needed to manage recipients, products, occasions, and gifts.

- RECIPIENT: name, emoji, group/tag, gift-giving prompt, budget, CRUD
- PRODUCT: name, link, description, price, photo auto-fetch, CRUD
- GIFT: auto-named, type, status tracking, notes, notes on reception, CRUD
- OCCASION: auto-named, date, start shopping date, ship date, total spend, CRUD
- HOLIDAY: name, icon, date logic, default recipients, add from system list, create custom
- System automation: auto-create occasions on holiday add
- System automation: auto-create placeholder gifts on occasion

### Phase 2 — Future
Nice-to-haves once the core is solid.

- Product tags (user-generated taxonomy)
- Star rating on gifts
- More AI-powered product recommendations

---

## Open Questions

1. **Onboarding / first-use flow** — What does a brand new user do first? Likely: add recipients → add holidays → system generates occasions. This sequence needs to be designed.
