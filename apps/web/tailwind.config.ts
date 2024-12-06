import type { Config } from 'tailwindcss';
/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
    content: [
        './node_modules/rizzui/dist/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            animation: {
                'smooth-bounce': 'smooth-bounce 0.5s ease-in-out',
            },
            keyframes: {
                'smooth-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            colors: {
                /*
                 * body, modal, drawer background & ring-offset-color
                 */
                background: 'rgb(var(--background) / <alpha-value>)',

                /*
                 * body text color
                 */
                foreground: 'rgb(var(--foreground) / <alpha-value>)',

                /*
                 * border, default flat bg color for input components, tab & dropdown hover color
                 */
                muted: 'rgb(var(--muted) / <alpha-value>)',

                /*
                 * disable foreground color
                 */
                'muted-foreground':
                    'rgb(var(--muted-foreground) / <alpha-value>)',

                /*
                 * primary colors
                 */
                primary: {
                    lighter: 'rgb(var(--primary-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--primary-default) / <alpha-value>)',
                    dark: 'rgb(var(--primary-dark) / <alpha-value>)',
                    foreground:
                        'rgb(var(--primary-foreground) / <alpha-value>)',
                },

                /*
                 * secondary colors
                 */
                secondary: {
                    lighter: 'rgb(var(--secondary-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--secondary-default) / <alpha-value>)',
                    dark: 'rgb(var(--secondary-dark) / <alpha-value>)',
                    foreground:
                        'rgb(var(--secondary-foreground) / <alpha-value>)',
                },

                /*
                 * danger colors
                 */
                red: {
                    lighter: 'rgb(var(--red-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--red-default) / <alpha-value>)',
                    dark: 'rgb(var(--red-dark) / <alpha-value>)',
                },

                /*
                 * warning colors
                 */
                orange: {
                    lighter: 'rgb(var(--orange-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--orange-default) / <alpha-value>)',
                    dark: 'rgb(var(--orange-dark) / <alpha-value>)',
                },

                /*
                 * info colors
                 */
                blue: {
                    lighter: 'rgb(var(--blue-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--blue-default) / <alpha-value>)',
                    dark: 'rgb(var(--blue-dark) / <alpha-value>)',
                },

                /*
                 * success colors
                 */
                green: {
                    lighter: 'rgb(var(--green-lighter) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--green-default) / <alpha-value>)',
                    dark: 'rgb(var(--green-dark) / <alpha-value>)',
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
    darkMode: ['class', '[data-theme="dark"]'],
} satisfies Config;
