import React from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(() => {
    // Check for SSR
    if (typeof window === 'undefined') return false;
    
    // Get stored theme or check system preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    
    // Check system preference with a proper media query
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        updateMetaThemeColor(true);
      } else {
        root.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        updateMetaThemeColor(false);
      }
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    };

    // Apply theme immediately
    applyTheme(isDark);

    // Handle system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    // Use modern event listener with fallback
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isDark]);

  // Function to update meta theme color
  const updateMetaThemeColor = (dark: boolean) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
    const metaThemeColorLight = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
    
    if (dark) {
      metaThemeColor?.setAttribute('media', '');
      metaThemeColorLight?.setAttribute('media', 'not all');
    } else {
      metaThemeColor?.setAttribute('media', 'not all');
      metaThemeColorLight?.setAttribute('media', '');
    }
  };

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 touch-manipulation"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}