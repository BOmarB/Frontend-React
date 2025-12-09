import React from "react";
import { useTheme } from "../contexts/themeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Moon className="w-5 h-5 text-gray-800 dark:text-yellow-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
