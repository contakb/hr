module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      display: ['print'], // Add print variant for display utilities
      // You can add other utilities here as needed
    },
  },
  plugins: [],
};
