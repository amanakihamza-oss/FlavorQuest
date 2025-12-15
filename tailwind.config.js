/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    orange: '#FF7E36', // Warm appetizing orange
                    red: '#E63946', // Action/Error
                    yellow: '#FFB703', // Stars/Highlight
                    dark: '#1D1D1D', // Text/Background
                    gray: '#F5F5F5', // Soft background
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
