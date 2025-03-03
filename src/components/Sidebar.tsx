import React from 'react';
import { FileIcon, TagIcon, CalendarIcon, X } from 'lucide-react';
import { FilterOptions } from '../types';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  isMobile: boolean;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableCategories: string[];
  availableTags: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  visible, 
  onClose, 
  isMobile, 
  filters, 
  setFilters,
  availableCategories,
  availableTags
}) => {
  // Document types
  const documentTypes = [
    { id: 'all', label: 'All' },
    { id: 'pdf', label: 'PDF' },
    { id: 'doc', label: 'DOC' },
    { id: 'article', label: 'Article' },
    { id: 'image', label: 'Image' }
  ];
  
  // Time filters
  const timeFilters = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This week' },
    { id: 'thisMonth', label: 'This month' }
  ];

  // Conditional class for main container
  const containerClass = isMobile
    ? `fixed inset-y-0 left-0 transform ${
        visible ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 z-20 transition-transform duration-300 ease-in-out`
    : 'h-full bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700 p-4 transition-colors duration-300';

  // Handle type filter changes
  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (typeId === 'all') {
      // If "All" is selected, remove other filters
      setFilters(prev => ({
        ...prev,
        types: checked ? ['all'] : []
      }));
    } else {
      setFilters(prev => {
        // Remove "all" if it's selected
        const updatedTypes = prev.types.filter(t => t !== 'all');
        
        if (checked) {
          // Add the new type
          return { ...prev, types: [...updatedTypes, typeId] };
        } else {
          // Remove the deselected type
          return { ...prev, types: updatedTypes.filter(t => t !== typeId) };
        }
      });
    }
  };

  // Handle category filter changes
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (category === 'all') {
      // If "All" is selected, remove other filters
      setFilters(prev => ({
        ...prev,
        categories: checked ? ['all'] : []
      }));
    } else {
      setFilters(prev => {
        // Remove "all" if it's selected
        const updatedCategories = prev.categories.filter(c => c !== 'all');
        
        if (checked) {
          // Add the new category
          return { ...prev, categories: [...updatedCategories, category] };
        } else {
          // Remove the deselected category
          return { ...prev, categories: updatedCategories.filter(c => c !== category) };
        }
      });
    }
  };

  // Handle time filter changes
  const handleTimeChange = (timeId: string) => {
    setFilters(prev => ({
      ...prev,
      timeframe: timeId as 'all' | 'today' | 'thisWeek' | 'thisMonth'
    }));
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        // Remove the tag if already selected
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        // Add the tag if not selected
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  // Display available categories
  const displayCategories = () => {
    // Filter all unique categories and remove duplicates
    return availableCategories.map((category, index) => {
      const label = category === 'all' 
        ? 'All' 
        : category === 'uncategorized' 
          ? 'Uncategorized' 
          : category;
      
      return (
        <label 
          key={index} 
          className="flex items-center text-sm text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white cursor-pointer transition-colors duration-300"
        >
          <input
            type="checkbox"
            checked={filters.categories.includes(category)}
            onChange={(e) => handleCategoryChange(category, e.target.checked)}
            className="h-4 w-4 rounded text-primary-500 border-dark-300 dark:border-dark-600 focus:ring-primary-500 transition-colors duration-300"
          />
          <span className="ml-2">{label}</span>
        </label>
      );
    });
  };

  return (
    <div className={containerClass}>
      <div className={`h-full overflow-y-auto ${isMobile ? 'pt-16 pb-4' : 'pb-0'}`}>
        <div className="px-4 py-2">
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-dark-800 dark:text-dark-100">Filters</h3>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors duration-300"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Filter by document type */}
          <div className="mb-6">
            <div className="flex items-center mb-3 text-dark-700 dark:text-dark-300">
              <FileIcon className="h-4 w-4 mr-2" />
              <h3 className="text-sm font-medium">Type</h3>
            </div>
            <div className="space-y-2">
              {documentTypes.map((type) => (
                <label 
                  key={type.id} 
                  className="flex items-center text-sm text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white cursor-pointer transition-colors duration-300"
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type.id)}
                    onChange={(e) => handleTypeChange(type.id, e.target.checked)}
                    className="h-4 w-4 rounded text-primary-500 border-dark-300 dark:border-dark-600 focus:ring-primary-500 transition-colors duration-300"
                  />
                  <span className="ml-2">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter by category */}
          <div className="mb-6">
            <div className="flex items-center mb-3 text-dark-700 dark:text-dark-300">
              <TagIcon className="h-4 w-4 mr-2" />
              <h3 className="text-sm font-medium">Category</h3>
            </div>
            <div className="space-y-2">
              {displayCategories()}
            </div>
          </div>

          {/* Filter by date */}
          <div className="mb-6">
            <div className="flex items-center mb-3 text-dark-700 dark:text-dark-300">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <h3 className="text-sm font-medium">Date</h3>
            </div>
            <div className="space-y-2">
              {timeFilters.map((filter) => (
                <label 
                  key={filter.id} 
                  className="flex items-center text-sm text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white cursor-pointer transition-colors duration-300"
                >
                  <input
                    type="radio"
                    name="timeFilter"
                    checked={filters.timeframe === filter.id}
                    onChange={() => handleTimeChange(filter.id)}
                    className="h-4 w-4 rounded-full text-primary-500 border-dark-300 dark:border-dark-600 focus:ring-primary-500 transition-colors duration-300"
                  />
                  <span className="ml-2">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Popular tags */}
          {availableTags.length > 0 && (
            <div>
              <div className="flex items-center mb-3 text-dark-700 dark:text-dark-300">
                <TagIcon className="h-4 w-4 mr-2" />
                <h3 className="text-sm font-medium">Popular tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 8).map((tag, index) => (
                  <span
                    key={index}
                    onClick={() => handleTagClick(tag)}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-300 ${
                      filters.tags.includes(tag)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Button to clear filters */}
          {(filters.types.length > 0 || 
            filters.categories.length > 0 || 
            filters.timeframe !== 'all' || 
            filters.tags.length > 0) && (
            <div className="mt-6 border-t border-dark-200 dark:border-dark-700 pt-4">
              <button
                onClick={() => setFilters({
                  types: [],
                  categories: [],
                  timeframe: 'all',
                  tags: []
                })}
                className="w-full py-2 px-3 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;