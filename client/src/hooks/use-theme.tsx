import { useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  
  // Set initial theme based on user preference
  useEffect(() => {
    // Only set theme if it's not already set
    const currentTheme = localStorage.getItem("theme");
    if (!currentTheme) {
      // Check if user prefers dark mode
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, [setTheme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark"
  };
}
