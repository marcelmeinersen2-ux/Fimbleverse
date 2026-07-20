import type { Config } from 'tailwindcss';

// Fimbleverse palette — derived from the app icon (green Fimble, pink spiral).
// The character is vivid; the app stays calm. Green leads (actions, brand),
// pink is a warm accent used sparingly (highlights, the balance moment).
// Text uses the icon's deep forest green for warmth and legibility.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#F5F8F3',  // barely-green soft paper
        surface:   '#FFFFFF',
        ink:       '#2A3D28',  // deep forest green (from icon) for text
        muted:     '#6E7E6B',  // muted green-grey
        line:      '#E0E8DC',  // soft green-tinted border
        primary:   '#4E9E4A',  // Fimble green — primary actions
        'primary-ink': '#FFFFFF',
        accent:    '#E58A97',  // spiral pink — warm highlights
        'accent-ink': '#5A2A32',
        danger:    '#C4574E',  // muted clay red
        success:   '#4E9E4A',
        warning:   '#C99A3E',
        focus:     '#4E9E4A',
      },
      borderRadius: { card: '16px', control: '11px' },
      boxShadow: { soft: '0 1px 2px rgba(42,61,40,0.05), 0 6px 20px rgba(42,61,40,0.05)' },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
