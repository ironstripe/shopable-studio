import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'spectral': ['Spectral', 'Georgia', 'serif'],
        'inter-thin': ['Inter', 'sans-serif'],
        'playfair': ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        shopable: {
          blue: "hsl(var(--shopable-blue))",
          black: "hsl(var(--shopable-black))",
          grey900: "hsl(var(--shopable-grey-900))",
          grey300: "hsl(var(--shopable-grey-300))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(3px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "micro-zoom": {
          "0%": { opacity: "0", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.015)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "card-enter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "card-exit": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(4px)" }
        },
        "luxury-card-enter": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(6px) scale(0.98)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0) scale(1)" 
          }
        },
        "luxury-card-exit": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.98)" }
        },
        "tap-ripple": {
          "0%": { opacity: "1", transform: "scale(0.85)" },
          "100%": { opacity: "0", transform: "scale(1.15)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 220ms ease-out",
        "slide-left": "slide-left 220ms ease-out",
        "micro-zoom": "micro-zoom 240ms ease-out",
        "card-enter": "card-enter 180ms ease-out",
        "card-exit": "card-exit 100ms ease-out",
        "luxury-card-enter": "luxury-card-enter 200ms ease-out",
        "luxury-card-exit": "luxury-card-exit 120ms ease-out",
        "tap-ripple": "tap-ripple 180ms ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
