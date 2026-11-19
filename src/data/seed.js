export const holidays = [
  { id: 'h1', name: 'Christmas', icon: '🎄', date_logic: { type: 'fixed', month: 12, day: 25 }, is_system: true },
  { id: 'h2', name: "Luke's Birthday", icon: '🎂', date_logic: { type: 'fixed', month: 6, day: 15 }, is_system: false },
  { id: 'h3', name: "Mom's Birthday", icon: '🎂', date_logic: { type: 'fixed', month: 8, day: 3 }, is_system: false },
  { id: 'h4', name: 'Easter', icon: '🐣', date_logic: { type: 'calculated', rule: 'easter' }, is_system: true },
]

export const recipients = [
  {
    id: 'r1',
    name: 'Luke',
    emoji: '👦',
    gift_prompt: 'Loves hiking, cooking, and sci-fi novels. Has minimalist taste and hates clutter.',
    budget: '$40–60',
    group_tag: 'Family',
    shipping_address: '123 Pine St, Portland OR 97201',
  },
  {
    id: 'r2',
    name: 'Mom',
    emoji: '👩',
    gift_prompt: 'Loves gardening, cooking shows, and anything cozy. Appreciates quality over quantity.',
    budget: '$50–80',
    group_tag: 'Family',
    shipping_address: '123 Pine St, Portland OR 97201',
  },
  {
    id: 'r3',
    name: 'Lucky',
    emoji: '🐕',
    gift_prompt: 'A golden retriever who loves squeaky toys, tennis balls, and treats.',
    budget: '$20–30',
    group_tag: 'Family',
    shipping_address: '123 Pine St, Portland OR 97201',
  },
  {
    id: 'r4',
    name: 'Arden',
    emoji: '🧑',
    gift_prompt: 'Creative and curious. Loves art supplies, thoughtful books, and experiences over things. Into sustainability.',
    budget: '$30–50',
    group_tag: 'Friends',
    shipping_address: null,
  },
]

export const products = [
  {
    id: 'p1',
    name: 'Rocker Garlic Press',
    link: 'https://amazon.com',
    description: 'Sturdy, easy to clean, fits any clove size. A genuine kitchen upgrade.',
    price: 35,
    photo_url: null,
  },
  {
    id: 'p2',
    name: '4000 Weeks',
    link: 'https://bookshop.org',
    description: 'A book about time and mortality by Oliver Burkeman. Thoughtful and perspective-shifting.',
    price: 18,
    photo_url: null,
  },
  {
    id: 'p3',
    name: 'Play Silks',
    link: 'https://amazon.com',
    description: 'Colorful open-ended play silks, great for kids and creative types.',
    price: 45,
    photo_url: null,
  },
  {
    id: 'p4',
    name: 'Large Magnetic Calendar',
    link: 'https://amazon.com',
    description: 'Dry-erase magnetic monthly calendar for the fridge. Great for families.',
    price: 55,
    photo_url: null,
  },
  {
    id: 'p5',
    name: 'Picnic in the Woods',
    link: null,
    description: 'A curated outdoor picnic experience — blanket, charcuterie, a hike. Personal and memorable.',
    price: 80,
    photo_url: null,
  },
]

export const occasions = [
  { id: 'o1', holiday_id: 'h1', name: 'Christmas 2025', date: '2025-12-25', start_shopping_date: '2025-11-15', ship_date: '2025-12-18', notes: null },
  { id: 'o2', holiday_id: 'h1', name: 'Christmas 2026', date: '2026-12-25', start_shopping_date: '2026-11-15', ship_date: '2026-12-18', notes: null },
  { id: 'o3', holiday_id: 'h1', name: 'Christmas 2027', date: '2027-12-25', start_shopping_date: null, ship_date: null, notes: null },
  { id: 'o4', holiday_id: 'h2', name: "Luke's Birthday 2025", date: '2025-06-15', start_shopping_date: null, ship_date: null, notes: null },
  { id: 'o5', holiday_id: 'h2', name: "Luke's Birthday 2026", date: '2026-06-15', start_shopping_date: '2026-06-08', ship_date: '2026-06-12', notes: 'He mentioned wanting something for the kitchen.' },
  { id: 'o6', holiday_id: 'h2', name: "Luke's Birthday 2027", date: '2027-06-15', start_shopping_date: null, ship_date: null, notes: null },
  { id: 'o7', holiday_id: 'h3', name: "Mom's Birthday 2025", date: '2025-08-03', start_shopping_date: null, ship_date: null, notes: null },
  { id: 'o8', holiday_id: 'h3', name: "Mom's Birthday 2026", date: '2026-08-03', start_shopping_date: '2026-07-25', ship_date: '2026-07-30', notes: null },
  { id: 'o9', holiday_id: 'h4', name: 'Easter 2026', date: '2026-04-05', start_shopping_date: null, ship_date: null, notes: null },
]

export const gifts = [
  // Past
  { id: 'g1', occasion_id: 'o1', name: '4000 Weeks for Luke', notes: null, reception_notes: 'He loved it — read it in two weeks.', type: 'physical', physical_status: 'received', experience_status: null },
  { id: 'g2', occasion_id: 'o1', name: 'Play Silks for Arden', notes: null, reception_notes: 'Became her favorite gift of the year.', type: 'physical', physical_status: 'received', experience_status: null },
  { id: 'g3', occasion_id: 'o7', name: 'Rocker Garlic Press for Mom', notes: 'Wrapped with a ribbon.', reception_notes: 'She uses it every day now.', type: 'physical', physical_status: 'received', experience_status: null },
  { id: 'g4', occasion_id: 'o4', name: 'Picnic in the Woods for Luke', notes: 'Planned for his birthday weekend.', reception_notes: 'Best birthday yet, per him.', type: 'experience', physical_status: null, experience_status: 'executed' },
  // Upcoming — Christmas 2026 (placeholders)
  { id: 'g5', occasion_id: 'o2', name: 'Christmas gift for Luke', notes: null, reception_notes: null, type: null, physical_status: 'idea', experience_status: null },
  { id: 'g6', occasion_id: 'o2', name: 'Christmas gift for Mom', notes: null, reception_notes: null, type: null, physical_status: 'idea', experience_status: null },
  { id: 'g7', occasion_id: 'o2', name: 'Christmas gift for Arden', notes: null, reception_notes: null, type: null, physical_status: 'idea', experience_status: null },
  { id: 'g8', occasion_id: 'o2', name: 'Christmas gift for Lucky', notes: null, reception_notes: null, type: null, physical_status: 'idea', experience_status: null },
  // Upcoming — Luke's Birthday 2026
  { id: 'g9', occasion_id: 'o5', name: 'Large Magnetic Calendar for Luke', notes: 'He mentioned wanting one for the kitchen.', reception_notes: null, type: 'physical', physical_status: 'purchased', experience_status: null },
]

export const giftRecipients = [
  { gift_id: 'g1', recipient_id: 'r1' },
  { gift_id: 'g2', recipient_id: 'r4' },
  { gift_id: 'g3', recipient_id: 'r2' },
  { gift_id: 'g4', recipient_id: 'r1' },
  { gift_id: 'g5', recipient_id: 'r1' },
  { gift_id: 'g6', recipient_id: 'r2' },
  { gift_id: 'g7', recipient_id: 'r4' },
  { gift_id: 'g8', recipient_id: 'r3' },
  { gift_id: 'g9', recipient_id: 'r1' },
]

export const giftProducts = [
  { gift_id: 'g1', product_id: 'p2' },
  { gift_id: 'g2', product_id: 'p3' },
  { gift_id: 'g3', product_id: 'p1' },
  { gift_id: 'g4', product_id: 'p5' },
  { gift_id: 'g9', product_id: 'p4' },
]

export const holidayRecipients = [
  { holiday_id: 'h1', recipient_id: 'r1' },
  { holiday_id: 'h1', recipient_id: 'r2' },
  { holiday_id: 'h1', recipient_id: 'r3' },
  { holiday_id: 'h1', recipient_id: 'r4' },
  { holiday_id: 'h2', recipient_id: 'r1' },
  { holiday_id: 'h3', recipient_id: 'r2' },
]

export const holidayProducts = [
  { holiday_id: 'h1', product_id: 'p2' },
  { holiday_id: 'h1', product_id: 'p3' },
  { holiday_id: 'h1', product_id: 'p4' },
  { holiday_id: 'h2', product_id: 'p4' },
]
