/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Charcoal & Black Palette (Preferred by user!)
        charcoal: {
          950: '#0B0D10', // Deep obsidian canvas
          900: '#11141A', // Dark charcoal sidebar
          850: '#141820', // Card surface
          800: '#191E28', // Elevated card
          750: '#1F2532', // Hover state
          700: '#262D3D', // Border
        },
        // Clean Light Canvas
        canvas: {
          light: '#F3F5F8',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        },
        // Vibrant Blue/Cyan Accent
        brand: {
          DEFAULT: '#0284C7', // Sky Blue
          cyan: '#38BDF8',
          hover: '#0369A1',
          subtle: 'rgba(2, 132, 199, 0.12)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        dyslexic: ['"Lexend"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-dark': '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 2px 6px -2px rgba(0, 0, 0, 0.3)',
        'card-light': '0 10px 30px -4px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
