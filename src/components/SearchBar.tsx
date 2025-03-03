import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchQuery }) => {
  const [query, setQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  
  // Update local state when prop changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Debounce to avoid searching with each character
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [query]);
  
  // Perform search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-dark-400 dark:text-dark-500" />
          </div>
          <input
            type="text"
            className="block w-full py-2 pl-10 pr-10 border border-dark-300 dark:border-dark-700 rounded-lg 
              focus:ring-primary-500 focus:border-primary-500 
              text-dark-800 dark:text-dark-100 
              placeholder-dark-400 dark:placeholder-dark-500
              bg-white dark:bg-dark-800
              transition-colors duration-300"
            placeholder="Search by title, tags or category..."
            value={query}
            onChange={handleChange}
          />
          {query && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className="text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 focus:outline-none transition-colors duration-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;