import { defineConfig } from "@pandacss/dev";
import { paneParentRecipe } from "./panda/recipes/pane-parent";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./apps/blog/**/*.{js,jsx,ts,tsx}"],

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
      containerSizes: {
        /** 800px tree frame plus a symmetric 10px classic-scrollbar gutter. */
        searchTreeFrame: "820px",
      },
      tokens: {
        spacing: {
          layout: { value: "{spacing.3}" }, // 12px
          /** Padding-top for page shells under the fixed `navbar` status bar (blog + admin). */
          navHeight: { value: "70px" },
        },
        colors: {
          /** Subtle rim for dark glass panels (blog tiles + admin shells). */
          glass: {
            border: { value: "rgba(255, 255, 255, 0.12)" },
          },
        },
      },
      recipes: {
        paneParent: paneParentRecipe,
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
        pageWithMargins: {
          description: "Page container with consistent viewport margins matching navbar",
          value: {
            pt: "{spacing.navHeight}",
            pb: "{spacing.layout}",
            px: "{spacing.layout}",
            minH: "100vh",
            w: "100%",
            boxSizing: "border-box",
          } as any,
        },
        adminShell: {
          description:
            "Dashboard column: flex stack so brand chrome + main region participate in viewport layout (main wraps route output).",
          value: {
            display: "flex",
            flexDirection: "column",
            w: "100%",
            maxW: "1180px",
            mx: "auto",
            px: "{spacing.layout}",
            pt: "{spacing.navHeight}",
            pb: "{spacing.8}",
            minH: "100vh",
            boxSizing: "border-box",
          } as any,
        },
        adminPanel: {
          description:
            "Primary admin glass panel — matches blog post shell (rgba, blur) without whole-node opacity wash-out",
          value: {
            position: "relative",
            zIndex: 1,
            borderRadius: "10px",
            bg: "rgba(0, 0, 0, 0.72)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "glass.border",
            boxShadow: "#00000F 0 0 10px",
            backdropFilter: "blur(10px)",
            p: "{spacing.5}",
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
