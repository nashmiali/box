@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer base {
  body {
    @apply bg-zinc-950 text-zinc-100 font-sans antialiased;
  }
  
  /* Focus states for TV/Remote navigation */
  :focus-visible {
    @apply outline-none ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950;
  }
}

@font-face {
  font-family: 'TheYearOfHandicrafts';
  src: url('https://alfont.com/wp-content/fonts/new-arabic-fonts//alfont_com_TheYearofHandicrafts-Black.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@theme {
  --color-primary: #E50914; /* Netflix Red for a premium streaming feel */
  --color-primary-hover: #F40612;
  --color-bg-light: var(--bg-color);
  --color-text-main: var(--text-color);
  --color-card-bg: var(--card-bg);
  --font-sans: 'TheYearOfHandicrafts', ui-sans-serif, system-ui, sans-serif;
}

:root {
  --bg-color: #0f0f11; /* Deep dark background by default for streaming */
  --text-color: #ffffff;
  --card-bg: #18181b;
}

.dark {
  --bg-color: #09090b;
  --text-color: #ffffff;
  --card-bg: #18181b;
}

html {
  /* Fluid scaling: 14px on mobile (375px), scales up to ~24px on 1080p TVs */
  font-size: clamp(14px, 0.8vw + 11px, 24px);
  -webkit-text-size-adjust: 100%;
  overscroll-behavior-y: none;
}

body {
  font-family: 'TheYearOfHandicrafts', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  direction: rtl; /* Arabic is RTL */
  transition: background-color 0.3s ease, color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  
  /* Native App Behaviors */
  overscroll-behavior-y: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  overflow-x: hidden;
}

/* Allow text selection in inputs */
input, textarea {
  user-select: auto;
}

/* Global Focus Styles for TV Remote Navigation */
button:focus-visible, 
a:focus-visible, 
[role="button"]:focus-visible,
input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--color-primary);
  transform: scale(1.05);
  transition: all 0.2s ease;
  z-index: 50;
}

/* Custom Scrollbar for horizontal scrolling */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Glassmorphism utilities */
.glass-panel {
  background: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Smooth image loading */
img {
  transition: opacity 0.3s ease-in-out;
}
img[loading] {
  opacity: 0;
}
img.loaded {
  opacity: 1;
}
