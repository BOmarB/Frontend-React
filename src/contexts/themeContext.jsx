import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize state with a more robust check including SSR safety
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // First check saved theme, then system preference
    return savedTheme ? savedTheme === "dark" : prefersDark;
  });

  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Handle initial theme setup
  useEffect(() => {
    // Set mounted state
    setMounted(true);

    // Add initial theme without transition
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem("theme");
      // Only update if user hasn't manually set a theme
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!mounted) return;

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    // Add transition class before theme change
    document.documentElement.classList.add("theme-transition");

    // Small delay to ensure transition class is applied
    requestAnimationFrame(() => {
      setIsDarkMode((prevMode) => !prevMode);

      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 200); // Match this duration with your CSS transition duration
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
