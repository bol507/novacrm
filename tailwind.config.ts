import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class', // 👈 ¡ESTO ES OBLIGATORIO!
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
} satisfies Config