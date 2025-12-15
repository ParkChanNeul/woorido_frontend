/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // ----------------------------------------
      // Brand Colors
      // ----------------------------------------
      colors: {
        woorido: {
          DEFAULT: "#FF4E00",
          light: "#FF7A3D",
          dark: "#CC3E00",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF4E00",
          600: "#CC3E00",
          700: "#9A2E00",
          800: "#6B1F00",
          900: "#3D1100",
        },

        // Surface Colors (Dark Theme)
        surface: {
          bg: "#0A0A0A",
          1: "#111111",
          2: "#1A1A1A",
          3: "#242424",
          border: "#2E2E2E",
          "border-light": "#404040",
        },

        // Glass Effect
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          light: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.1)",
        },

        // Content Colors
        content: {
          primary: "#FFFFFF",
          secondary: "#A3A3A3",
          tertiary: "#666666",
          inverse: "#0A0A0A",
        },

        // Semantic Colors
        semantic: {
          success: "#22C55E",
          "success-light": "#4ADE80",
          error: "#EF4444",
          "error-light": "#F87171",
          warning: "#F59E0B",
          "warning-light": "#FBBF24",
          info: "#3B82F6",
          "info-light": "#60A5FA",
        },

        // Gradient (Reserved for Future)
        gradient: {
          purple: "#8B5CF6",
          pink: "#EC4899",
          orange: "#F97316",
        },
      },

      // ----------------------------------------
      // Shadows
      // ----------------------------------------
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.5)",
        button: "0 4px 14px rgba(255, 78, 0, 0.3)",
        "button-hover": "0 6px 20px rgba(255, 78, 0, 0.4)",
        glow: "0 0 20px rgba(255, 78, 0, 0.4)",
        "inner-light": "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },

      // ----------------------------------------
      // Border Radius
      // ----------------------------------------
      borderRadius: {
        "4xl": "2rem",
      },

      // ----------------------------------------
      // Typography
      // ----------------------------------------
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        number: ["Pretendard Variable", "SF Pro Display", "system-ui", "sans-serif"],
      },

      // ----------------------------------------
      // Animations
      // ----------------------------------------
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-in-up": "fadeInUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "pulse-soft": "pulseSoft 2s infinite",
        gauge: "gauge 1s ease-out forwards",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        slideDown: {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        gauge: {
          from: { strokeDashoffset: "100" },
          to: { strokeDashoffset: "var(--gauge-value, 0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
