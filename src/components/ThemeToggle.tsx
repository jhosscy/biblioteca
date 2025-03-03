import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md focus:outline-none transition-colors duration-300"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-300 hover:text-yellow-200" />
      ) : (
        <Moon className="h-5 w-5 text-dark-500 hover:text-dark-700" />
      )}
    </button>
  );
};

export default ThemeToggle;