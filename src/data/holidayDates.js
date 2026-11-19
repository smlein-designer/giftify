// Dates for holidays set by lunar or lunisolar calendars, which can't be
// computed with a simple rule. Looked up Nov 2026; extend these lists as years pass.
//
// Sources: Hebcal (Hanukkah, first candle evening), China Highlights and
// published calendars (Lunar New Year), Old Farmer's Almanac and public
// holiday calendars (Diwali main day, Lakshmi Puja), Umm al-Qura based
// estimates (Eid al-Fitr; final date depends on moon sighting and can
// differ by a day).
export const HOLIDAY_DATES = {
  hanukkah: [
    '2026-12-04', '2027-12-24', '2028-12-12', '2029-12-01', '2030-12-20',
    '2031-12-09', '2032-11-27', '2033-12-16', '2034-12-06', '2035-12-25',
  ],
  'lunar-new-year': [
    '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03',
    '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08',
  ],
  diwali: ['2026-11-08', '2027-10-29', '2028-10-17', '2029-11-05', '2030-10-26'],
  'eid-al-fitr': [
    '2026-03-20', '2027-03-09', '2028-02-26', '2029-02-14', '2030-02-04',
    '2031-01-24', '2032-01-14', '2033-01-02', '2033-12-23',
  ],
}
