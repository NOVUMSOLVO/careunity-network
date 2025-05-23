import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  // Enable JIT mode
  jit: true,
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
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
        "heartbeat": {
          "0%": { transform: "scale(1)" },
          "10%": { transform: "scale(1.2)" },
          "20%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.2)" },
          "40%": { transform: "scale(1)" },
          "100%": { transform: "scale(1)" }
        },
        "draw-path": {
          "0%": { strokeDasharray: "100", strokeDashoffset: "100" },
          "100%": { strokeDasharray: "100", strokeDashoffset: "0" }
        },
        "pulse-line": {
          "0%": { strokeDashoffset: "200" },
          "50%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-200" }
        },
        "pulse-dot": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(200px)" }
        },
        "pill-move": {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(-8px)", opacity: "0.5" }
        },
        "medical-cross-pulse": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "50%": { transform: "scale(1.1)", opacity: "0.2" },
          "100%": { transform: "scale(0.8)", opacity: "0.8" }
        },
        "pill-fill": {
          "0%": { opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.2" }
        },
        "pill-fill-delay": {
          "0%": { opacity: "0.2" },
          "25%": { opacity: "0.2" },
          "75%": { opacity: "1" },
          "100%": { opacity: "0.2" }
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "0" }
        },
        "swipe-right": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "swipe-left": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "draw-path": "draw-path 1.5s ease-in-out forwards",
        "pulse-line": "pulse-line 2s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s linear infinite",
        "pill-move": "pill-move 2s ease-in-out infinite",
        "medical-cross-pulse": "medical-cross-pulse 2s ease-in-out infinite",
        "pulse-delay": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s",
        "pill-fill": "pill-fill 2s ease-in-out infinite",
        "pill-fill-delay": "pill-fill-delay 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "ripple": "ripple 0.6s ease-out forwards",
        "swipe-right": "swipe-right 0.3s ease-out",
        "swipe-left": "swipe-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;


