import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '1' },
          '50%': { transform: 'translateY(-20px) translateX(20px)', opacity: '0.5' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        colorHeader: "rgb(27,57,106)",  // Ejemplo de color RGB
        colorSideNav: "rgb(107,42,58)", // Ejemplo de color RGBA
        colorLogo: "rgb(255, 183, 27)", // Ejemplo de color RGBA
        colorNaranja: "rgb(255, 114, 0)", // Ejemplo de color RGBA
        colornuevo: "rgb(176,147,94)", // Ejemplo de color RGBA
        colorfuego: "rgb(255,57,43)", // Ejemplo de color RGBA
        colorDorado: "rgb(212,175,55)",
        colorGrisOscuro: "rgb(78,78, 78)",
        colorGrispalido: "rgb(245,241,241)",
        dorado: '#D4AF37',
        guinda: '#6B2A3A',
        guindaclaro: '#8A3E4E',
        amarillopálido: '#FFECB3',
      },
      textColor:{
        textSideNav: "rgb(107,42,58)",
        textNaranja: "rgb(255, 114, 0)", // Ejemplo de color RGBA
        textHeader: "rgb(27,57,106)", 
        textLogo: "rgb(255, 183, 27)",
        textnuevo: "rgb(176,147,94)", // Ejemplo de color RGBA
        textDorado: "rgb(212,175, 55)",
        textGrisOscuro: "rgb(78,78, 78)",
        textGrispalido: "rgb(245,241,241)",
      },
      borderColor:{
        borderSideNav: "rgb(130, 52, 52)",
        borderHeader: "rgb(45, 68, 108)",  // Ejemplo de color RGB
        borderLogo: "rgb(255, 183, 27)", // Ejemplo de color RGBA
        bordernuevo: "rgb(176,147,94)", // Ejemplo de color RGBA
      },
    },
  },
  plugins: [],
};

export default config;
