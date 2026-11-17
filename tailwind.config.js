/** @type {import('tailwindcss').Config} */

// Giftify design tokens: "Midnight & Marigold"
// Cool white paper, midnight ink, marigold on dark, amber for time pressure, green for done.
// See STYLEGUIDE.md.
const ink = '#151C3B'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F5F9', // page background
        card: '#FFFFFF', // raised surfaces
        sand: '#E8EAF2', // quiet fills, placeholders
        line: {
          DEFAULT: '#DDE0EA', // hairlines, card borders
          strong: '#C3C8D8', // input borders
        },
        ink: {
          DEFAULT: ink, // primary text + primary button
          soft: '#474F6D', // secondary text
          faint: '#5A6280', // tertiary text, icons
          hover: '#212A52',
        },
        amber: {
          DEFAULT: '#9A5200', // time pressure, highlights
          deep: '#7A4100',
          tint: '#FCEFD2',
        },
        sage: {
          DEFAULT: '#2C6E55', // done / received
          tint: '#DBEEE5',
        },
        focus: '#E1E6F8', // selection, focus halo
        marigold: '#F2B33D', // accent on dark surfaces only (hero, active nav, logo)
        ochre: {
          DEFAULT: '#7A5612',
          tint: '#F4E8CC',
        },
        danger: '#A8362A',

        // Legacy aliases so any older class names stay on-palette
        background: '#F4F5F9',
        surface: '#FFFFFF',
        border: '#DDE0EA',
        foreground: ink,
        muted: '#474F6D',
        accent: { DEFAULT: '#9A5200', hover: '#7A4100' },
        success: '#2C6E55',
        error: '#A8362A',
      },
      fontFamily: {
        display: ['"Syne Variable"', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk Variable"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // Large Syne numerals (countdowns, calendar days, totals): set nearly touching
        numeral: '-0.075em',
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        paper: '0 1px 0 rgba(42,31,45,0.04), 0 10px 30px -18px rgba(42,31,45,0.25)',
        lift: '0 1px 0 rgba(42,31,45,0.05), 0 18px 40px -20px rgba(42,31,45,0.35)',
        sheet: '-24px 0 60px -30px rgba(42,31,45,0.45)',
      },
      keyframes: {
        'sheet-in': { from: { transform: 'translateX(24px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { transform: 'translateY(6px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
      },
      animation: {
        'sheet-in': 'sheet-in 220ms cubic-bezier(.2,.8,.2,1)',
        'fade-in': 'fade-in 180ms ease-out',
        rise: 'rise 260ms cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
}
