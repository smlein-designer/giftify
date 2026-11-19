// Common gift-giving holidays a user can add from a list.
// Stored on the holiday row as date_logic (jsonb); `label` is how the rule reads in the UI.
const lunar = (key, label) => ({ type: 'table', key, label })

export const HOLIDAY_CATALOG = [
  { name: 'Lunar New Year', icon: '🧧', date_logic: lunar('lunar-new-year', 'First day of the lunar new year') },
  { name: 'Eid al-Fitr', icon: '🌙', date_logic: lunar('eid-al-fitr', 'End of Ramadan; set by moon sighting') },
  { name: 'Diwali', icon: '🪔', date_logic: lunar('diwali', 'Main day of the festival of lights') },
  { name: 'Hanukkah', icon: '🕎', date_logic: lunar('hanukkah', 'Begins at sundown; first night of eight') },
  { name: 'Kwanzaa', icon: '🕯️', date_logic: { type: 'fixed', month: 12, day: 26, label: 'December 26 to January 1' } },
  { name: "Valentine's Day", icon: '❤️', date_logic: { type: 'fixed', month: 2, day: 14 } },
  { name: 'Easter', icon: '🐣', date_logic: { type: 'calculated', rule: 'easter' } },
  {
    name: 'Administrative Professionals Day',
    icon: '💼',
    date_logic: { type: 'weekday', month: 4, weekday: 6, nth: -1, offset: -3, label: 'Wednesday of the last full week of April' },
  },
  {
    name: 'Teacher Appreciation Day',
    icon: '🍎',
    date_logic: { type: 'weekday', month: 5, weekday: 1, nth: 1, offset: 1, label: 'Tuesday of the first full week of May' },
  },
  { name: "Mother's Day", icon: '💐', date_logic: { type: 'weekday', month: 5, weekday: 0, nth: 2, label: 'Second Sunday in May' } },
  { name: "Father's Day", icon: '👔', date_logic: { type: 'weekday', month: 6, weekday: 0, nth: 3, label: 'Third Sunday in June' } },
  {
    name: 'Grandparents Day',
    icon: '🏡',
    date_logic: { type: 'weekday', month: 9, weekday: 1, nth: 1, offset: 6, label: 'The Sunday after Labor Day' },
  },
  { name: "Boss's Day", icon: '💼', date_logic: { type: 'fixed', month: 10, day: 16 } },
  { name: 'Thanksgiving', icon: '🍂', date_logic: { type: 'weekday', month: 11, weekday: 4, nth: 4, label: 'Fourth Thursday in November' } },
  { name: 'Christmas', icon: '🎄', date_logic: { type: 'fixed', month: 12, day: 25 } },
]

// Added to every new account on first sign-in
export const STARTER_HOLIDAYS = ['Christmas', 'Easter']

const norm = (s) => s.toLowerCase().replace(/[’']/g, '').trim()

// Catalog entries the user hasn't added yet (matched by name)
export function availableCatalogHolidays(holidays) {
  const have = new Set(holidays.map((h) => norm(h.name)))
  return HOLIDAY_CATALOG.filter((c) => !have.has(norm(c.name)))
}
