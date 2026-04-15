export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'otto-teal': 'var(--otto-teal)',
        'otto-teal-dark': 'var(--otto-teal-dark)',
        'otto-teal-darker': 'var(--otto-teal-darker)',
        'otto-teal-light': 'var(--otto-teal-light)',
        'otto-teal-mid': 'var(--otto-teal-mid)',
        'otto-amber': 'var(--otto-amber)',
        'otto-text': 'var(--otto-text)',
        'otto-muted': 'var(--otto-muted)',
        'otto-border': 'var(--otto-border)',
        'otto-surface': 'var(--otto-surface)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
