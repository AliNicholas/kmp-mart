/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        coop: {
          green: '#0F5132',
          gold: '#E5A93B',
          cream: '#FCFBF7',
        }
      }
    },
  },
  plugins: [],
}
