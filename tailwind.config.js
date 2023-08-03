module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false,
    theme: {
      
      fontFamily: {
        sans: ['PP Supply Mono', 'monospace'],
        serif: ['Merriweather', 'serif'],
      },
      extend: {
        colors: {
          'primary-green': '#00EC97',
          'primary-black': '#151718',
          'accent-yellow': '#F2FF9F',
          'accent-green': '#17D9D4',
          'accent-blue': '#3D7FFF',
          'gray-dark': '#3E3E3E',
          'gray-light': '#B6B6B6',
          'white': '#FFFFFF',
        },
      },
    },
    variants: {
      extend: {
        borderColor: '#3E3E3E'
      },
    },
    plugins: [],
  }