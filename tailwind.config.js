// tailwind.config.js
//extend color rgb(93, 176, 117) as primary
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}",
    "./Modulos/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(93, 176, 117)",
        secondary: "rgb(157, 130, 130)",
        "gray-button": "rgb(245, 245, 245)"
      },
    }
  },
  plugins: [],
}