/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        dark: {
          800: '#1e293b',
          900: '#0f172a'
        }
      }
    }
  },
  plugins: [require('daisyui'), require('@tailwindcss/forms')],
  corePlugins: {
    preflight: true,
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: '#22c55e',
          secondary: '#2563eb',
          accent: '#f59e0b',
          neutral: '#111827',
          'base-100': '#0f172a',
          'text-color': '#f1f5f9',
          info: '#3b82f6',
          success: '#16a34a',
          warning: '#eab308',
          error: '#dc2626'
        }
      },
      'dark'
    ]
  }
}
