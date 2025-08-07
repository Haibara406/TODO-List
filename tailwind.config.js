/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#f2f2f7',
          'bg-dark': '#000000',
          card: '#ffffff',
          'card-dark': '#1c1c1e',
          sidebar: '#f9f9f9',
          'sidebar-dark': '#1c1c1e',
          text: '#000000',
          'text-dark': '#ffffff',
          'text-secondary': '#8e8e93',
          'text-secondary-dark': '#8e8e93',
          accent: '#007aff',
          'accent-dark': '#0a84ff',
          border: '#c6c6c8',
          'border-dark': '#38383a',
          yellow: '#ffcc02',
          red: '#ff3b30',
          green: '#34c759',
          orange: '#ff9500'
        }
      },
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      borderRadius: {
        'ios': '10px'
      }
    },
  },
  plugins: [],
}