/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        heading: ["Oswald", "sans-serif"],
      },
      colors: {
        champion: {
          dark: "#050505",
          gold: "#D4AF37",
          silver: "#C0C0C0",
          card: "#111111",
          text: "#EAEAEA",
          muted: "#888888",
        },
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)",
        "gradient-dark": "linear-gradient(to bottom, #0a0a0a, #000000)",
      },
      boxShadow: {
        "neon-pink": "0 0 5px #ff2a9d, 0 0 10px #ff2a9d, 0 0 20px #ff2a9d",
        "neon-cyan": "0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 20px #00f0ff",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
