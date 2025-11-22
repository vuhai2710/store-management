/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        primary: "#2563EB",
        secondary: "#1E293B",
        background: "#F8FAFC",
        border: "#E2E8F0",
      },
      borderRadius: {
        xl: "0.75rem", // 12px
      },
      boxShadow: {
        card: "0 10px 25px rgba(15, 23, 42, 0.10)",
        cardHover: "0 20px 40px rgba(15, 23, 42, 0.12)",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          lg: "2rem",
        },
      },
    },
  },
  plugins: [],
};
