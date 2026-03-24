import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'Noto Sans SC', 'sans-serif'],
        body: ['Inter', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        /* 模块化字号阶梯 - 1.25 比例 */
        '2xs': ['0.625rem', { lineHeight: '1rem' }],      /* 10px - 极小标签 */
        'xs': ['0.75rem', { lineHeight: '1rem' }],        /* 12px - 小标签、徽章 */
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    /* 14px - 辅助文字 */
        'base': ['1rem', { lineHeight: '1.5rem' }],       /* 16px - 正文 */
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    /* 18px - 大正文 */
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     /* 20px - 小标题 */
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        /* 24px - 标题 */
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   /* 30px - 大标题 */
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     /* 36px - 页面标题 */
        '5xl': ['3rem', { lineHeight: '1.2' }],           /* 48px - 展示标题 */
      },
      spacing: {
        /* 4px 基准间距系统 */
        '0.5': '0.125rem',  /* 2px */
        '1': '0.25rem',     /* 4px */
        '1.5': '0.375rem',  /* 6px */
        '2': '0.5rem',      /* 8px */
        '2.5': '0.625rem',  /* 10px */
        '3': '0.75rem',     /* 12px */
        '4': '1rem',        /* 16px */
        '5': '1.25rem',     /* 20px */
        '6': '1.5rem',      /* 24px */
        '8': '2rem',        /* 32px */
        '10': '2.5rem',     /* 40px */
        '12': '3rem',       /* 48px */
        '16': '4rem',       /* 64px */
        '20': '5rem',       /* 80px */
        '24': '6rem',       /* 96px */
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.1), 0 2px 4px rgba(15, 23, 42, 0.06)',
        'dropdown': '0 4px 16px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.08)',
        /* 完整阴影层级 */
        'elevation-1': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'elevation-2': '0 1px 3px rgba(15, 23, 42, 0.1), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'elevation-3': '0 4px 6px rgba(15, 23, 42, 0.1), 0 2px 4px rgba(15, 23, 42, 0.06)',
        'elevation-4': '0 10px 15px rgba(15, 23, 42, 0.1), 0 4px 6px rgba(15, 23, 42, 0.05)',
        'elevation-5': '0 20px 25px rgba(15, 23, 42, 0.15), 0 10px 10px rgba(15, 23, 42, 0.08)',
      },
      /* Z-Index 层级 */
      zIndex: {
        'dropdown': '50',
        'sticky': '40',
        'navbar': '30',
        'modal-backdrop': '60',
        'modal': '70',
        'toast': '80',
        'tooltip': '90',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
    },
  },
  plugins: [typography],
}
