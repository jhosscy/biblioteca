import React from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { CurrentSection } from '../types';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  currentSection: CurrentSection;
  setCurrentSection: (section: CurrentSection) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentSection, 
  setCurrentSection, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  const { isDarkMode } = useTheme();
  
  const navItems = [
    { id: 'files', label: 'My Files' },
    { id: 'articles', label: 'My Articles' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'recent', label: 'Recent' }
  ];

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 fixed w-full top-0 z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-6 w-6 text-primary-500 dark:text-primary-400" />
              <span className="ml-2 text-lg font-semibold text-dark-900 dark:text-white">Library</span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id as CurrentSection)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                    currentSection === item.id
                      ? `bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300`
                      : `text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-700`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-dark-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 transition-colors duration-300">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id as CurrentSection);
                  setIsMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-300 ${
                  currentSection === item.id
                    ? `bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300`
                    : `text-dark-600 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-dark-900 dark:hover:text-white`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;