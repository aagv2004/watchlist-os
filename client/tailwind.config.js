/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Definamos unos colores minimalistas para tu "OS"
        brand: {
          bg: "#F9FAFB", // Gris casi blanco (limpio)
          sidebar: "#FFFFFF", // Blanco puro
          accent: "#000000", // Negro para contraste fuerte
        },
      },
    },
  },
  plugins: [],
};
