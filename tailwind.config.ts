import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        accent: {
          DEFAULT: '#FACC15',
          50: '#FEFCE8',
          100: '#FEF9C3',
          500: '#FACC15',
          600: '#CA8A04',
        },
        warm: {
          DEFAULT: '#FB923C',
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FB923C',
          600: '#EA580C',
        },
        surface: '#F0F9FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(59,130,246,0.08)',
        'card-hover': '0 4px 20px rgba(59,130,246,0.16)',
      },
    },
  },
  plugins: [typography],
} satisfies Config
