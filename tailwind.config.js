/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
        surface: '#f0f0eb',
        border: '#ddd8d2',
        foreground: '#222220',
        muted: '#6b6a66',
        accent: {
          DEFAULT: '#d4847a',
          hover: '#be6d63',
        },
        success: '#6a9e7f',
        error: '#c0544a',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.07)',
        md: '0 4px 12px rgba(0,0,0,0.09)',
      },
    },
  },
}
