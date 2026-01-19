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
      },
    },
  },
  plugins: [],
} satisfies Config;
