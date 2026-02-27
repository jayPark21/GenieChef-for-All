/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#4ADE80",
                "accent": "#FACC15",
                "youtube": "#FF0000",
                "fridge-blue": "#E0F2FE",
                "freezer-cyan": "#ECFEFF",
                "pantry-orange": "#FFF7ED",
                "carb": "#60A5FA",
                "protein": "#F87171",
                "fat": "#FB923C",
                "purple-200": "#E9D5FF",
                "purple-500": "#A855F7"
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "Noto Sans KR", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "3xl": "1.5rem", "full": "9999px" },
        },
    },
    plugins: [],
}
