import React from 'react';
import { Document } from '../types';
import { File, FileText, Image, FileSpreadsheet, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface FileCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
}

const FileCard: React.FC<FileCardProps> = ({ document, viewMode }) => {
  const { isDarkMode } = useTheme();
  
  const getIconByType = () => {
    switch (document.type) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case 'doc':
        return <FileText className="h-4 w-4 text-primary-500 dark:text-primary-400" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'article':
        return <FileSpreadsheet className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
      default:
        return <File className="h-4 w-4 text-dark-500 dark:text-dark-400" />;
    }
  };

  // Calculate text color based on background color and theme
  const getBgColorContrast = () => {
    const bgColor = document.backgroundColor || '#E3F2FD';
    
    // If in dark mode, always use light text for better readability
    if (isDarkMode) return 'text-white';
    
    // For light mode, calculate contrast
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    
    // Calculate perceived brightness (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black for light backgrounds, white for dark backgrounds
    return yiq >= 150 ? 'text-dark-900' : 'text-white';
  };

  const textColorClass = getBgColorContrast();

  // Adjust background color opacity in dark mode
  const getBgColorStyle = () => {
    if (isDarkMode) {
      // Convert hex to rgb for dark mode with opacity
      const bgColor = document.backgroundColor || '#E3F2FD';
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)` };
    }
    return { backgroundColor: document.backgroundColor || '#E3F2FD' };
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-dark-300 dark:border-dark-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
        <div 
          className="relative aspect-video flex items-center justify-center transition-colors duration-300 pt-2" 
          style={getBgColorStyle()}
        >
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-dark-800/90 rounded-md px-2 py-1 shadow-sm flex items-center border border-dark-200 dark:border-dark-700">
            {getIconByType()}
            <span className="ml-1 text-xs font-medium text-dark-900 dark:text-dark-100 uppercase">
              {document.type}
            </span>
          </div>
          
          {document.favorite && (
            <div className="absolute top-2 right-2">
              <Heart className="h-5 w-5 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400 drop-shadow-sm" />
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow border-t border-dark-200 dark:border-dark-700 transition-colors duration-300">
          <h3 className="font-medium text-dark-900 dark:text-dark-100 text-sm mb-2 line-clamp-2">{document.title}</h3>
          
          {document.category && (
            <p className="text-xs text-dark-600 dark:text-dark-400 mb-2">{document.category}</p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-800 dark:text-dark-300 border border-dark-200 dark:border-dark-600 transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-800 dark:text-dark-300 border border-dark-200 dark:border-dark-600 transition-colors duration-300">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
          
          <div className="mt-3 text-xs text-dark-500 dark:text-dark-400 transition-colors duration-300">
            {new Date(document.dateAdded).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-dark-300 dark:border-dark-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 p-3 flex items-center">
        <div 
          className="w-10 h-10 flex-shrink-0 rounded overflow-hidden flex items-center justify-center border border-dark-200 dark:border-dark-700 transition-colors duration-300"
          style={getBgColorStyle()}
        >
          {getIconByType()}
        </div>
        
        <div className="flex-grow min-w-0 ml-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-dark-900 dark:text-dark-100 text-sm truncate transition-colors duration-300">{document.title}</h3>
            {document.favorite && <Heart className="h-4 w-4 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400 flex-shrink-0 ml-2" />}
          </div>
          
          <div className="flex items-center text-xs text-dark-600 dark:text-dark-400 mt-1 transition-colors duration-300">
            <span className="font-medium uppercase mr-2">{document.type}</span>
            {document.category && (
              <span className="mr-2">• {document.category}</span>
            )}
            <span className="text-dark-500 dark:text-dark-500">{new Date(document.dateAdded).toLocaleDateString()}</span>
          </div>
          
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {document.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-800 dark:text-dark-300 border border-dark-200 dark:border-dark-600 transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-800 dark:text-dark-300 border border-dark-200 dark:border-dark-600 transition-colors duration-300">
                  +{document.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default FileCard;