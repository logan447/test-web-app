import type { Config } from "tailwindcss";

/**
 * Olera Design System - Tailwind Configuration
 *
 * Color palette aligned with Master Platform Manual Chapter 4.
 * Primary color: Olera Teal (#0D9488)
 *
 * @see docs/ui-style-guide.md for full design system documentation
 * @see docs/master-platform-manual.md Chapter 4 for specifications
 */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable references
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Primary Palette - Olera Teal (Manual Ch 4.2.2)
        // Brand color: warm, trustworthy, professional
        primary: {
          50: '#F0FDFA',   // Very light backgrounds, subtle highlights
          100: '#CCFBF1',  // Light backgrounds, badges, selected states
          200: '#99F6E4',  // Hover backgrounds
          300: '#5EEAD4',  // Decorative elements
          400: '#2DD4BF',  // Secondary emphasis
          500: '#14B8A6',  // Medium emphasis
          600: '#0D9488',  // PRIMARY - brand teal, buttons, links, accents
          700: '#0F766E',  // Hover states for primary
          800: '#115E59',  // Active/pressed states
          900: '#134E4A',  // Dark emphasis
        },

        // Secondary Palette - Neutral grays (Manual Ch 4.2.2)
        secondary: {
          DEFAULT: '#6B7280', // gray-500, secondary actions, borders
          hover: '#4B5563',   // gray-600, hover state
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // Semantic Colors (Manual Ch 4.2.2)
        success: {
          DEFAULT: '#10B981', // emerald-500
          light: '#D1FAE5',   // emerald-100
          dark: '#059669',    // emerald-600
        },
        warning: {
          DEFAULT: '#F59E0B', // amber-500
          light: '#FEF3C7',   // amber-100
          dark: '#D97706',    // amber-600
        },
        error: {
          DEFAULT: '#EF4444', // red-500
          light: '#FEE2E2',   // red-100
          dark: '#DC2626',    // red-600
        },
        info: {
          DEFAULT: '#3B82F6', // blue-500
          light: '#DBEAFE',   // blue-100
          dark: '#2563EB',    // blue-600
        },

        // Text Colors (Manual Ch 4.2.2)
        text: {
          primary: '#111827',   // gray-900, high contrast
          secondary: '#6B7280', // gray-500, de-emphasized
          muted: '#9CA3AF',     // gray-400, lowest emphasis
        },

        // Hero/accent background (from screenshot reference)
        cream: {
          50: '#FFFBF5',
          100: '#FEF7ED',
          200: '#FDF2E1',
        },

        // Provider Type Colors (for visual distinction)
        providerType: {
          facility: {
            DEFAULT: '#2563EB', // blue-600
            light: '#DBEAFE',   // blue-100
            dark: '#1D4ED8',    // blue-700
          },
          homeCare: {
            DEFAULT: '#059669', // emerald-600
            light: '#D1FAE5',   // emerald-100
            dark: '#047857',    // emerald-700
          },
          caregiver: {
            DEFAULT: '#7C3AED', // violet-600
            light: '#EDE9FE',   // violet-100
            dark: '#6D28D9',    // violet-700
          },
        },

        // Request/Engagement Status Colors
        status: {
          pending: {
            DEFAULT: '#F59E0B', // amber-500
            light: '#FEF3C7',   // amber-100
            text: '#92400E',    // amber-800
          },
          accepted: {
            DEFAULT: '#10B981', // emerald-500
            light: '#D1FAE5',   // emerald-100
            text: '#065F46',    // emerald-800
          },
          declined: {
            DEFAULT: '#EF4444', // red-500
            light: '#FEE2E2',   // red-100
            text: '#991B1B',    // red-800
          },
          completed: {
            DEFAULT: '#3B82F6', // blue-500
            light: '#DBEAFE',   // blue-100
            text: '#1E40AF',    // blue-800
          },
          scheduled: {
            DEFAULT: '#8B5CF6', // violet-500
            light: '#EDE9FE',   // violet-100
            text: '#5B21B6',    // violet-800
          },
        },

        // Match score colors
        match: {
          high: '#10B981',      // emerald-500 (80%+)
          medium: '#F59E0B',    // amber-500 (60-79%)
          low: '#6B7280',       // gray-500 (<60%)
        },
      },

      // Typography (Manual Ch 4.2.1)
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },

      // Spacing follows Tailwind defaults (4px base unit per Manual Ch 4.2.3)
      // No extensions needed - use space-1 through space-16

      // Border radius
      borderRadius: {
        'pill': '9999px', // For pill-shaped buttons
      },

      // Box shadows for cards and elevated elements
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'floating': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },

      // Section spacing (consistent vertical rhythm)
      spacing: {
        'section': '5rem',        // 80px - desktop sections
        'section-sm': '3rem',     // 48px - mobile sections
        'card-padding': '1.5rem', // 24px - standard card padding
        'card-padding-sm': '1rem', // 16px - compact card padding
      },

      // Custom animations
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        confetti: 'confetti 3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
