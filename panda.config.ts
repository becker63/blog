import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      breakpoints: {
        xsm: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      tokens: {
        spacing: {
          layout: { value: "{spacing.3}" }, // 12px
          navHeight: { value: "70px" }, // 57px (nav bottom) + 13px gap = 70px
        },
      },
      layerStyles: {
        navbar: {
          description: "Glassy standard navbar",
          value: {
            zIndex: 50,
            bg: "black",
            px: { base: "2", sm: "4" },
            opacity: 0.7,
            borderRadius: "10px",
            boxShadow: "#00000F 0 0 10px",
            top: "{spacing.layout}",
            left: "{spacing.layout}",
            right: "{spacing.layout}",
            mb: "{spacing.layout}",
          } as any,
        },
        pageContainer: {
          description: "Top-level page container matching fixed navbar",
          value: {
            pt: "{spacing.navHeight}",
            pb: "{spacing.layout}",
          } as any,
        },
      },
      keyframes: {
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blinkTextCursor: {
          from: { borderRightColor: "rgba(0, 0, 0, 0.75)" },
          to: { borderRightColor: "transparent" },
        },
        dash: {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
});
