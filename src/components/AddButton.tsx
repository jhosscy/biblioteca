import React, { useState } from 'react';
import { Plus, Upload, Edit, X } from 'lucide-react';

interface AddButtonProps {
  onAddArticle: () => void;
  onUploadFile: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onAddArticle, onUploadFile }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddArticle = () => {
    onAddArticle();
    setIsOpen(false);
  };

  const handleUploadFile = () => {
    onUploadFile();
    setIsOpen(false);
  };

  return (
    <div className="fixed right-4 bottom-4 z-10">
      {isOpen && (
        <div className="absolute bottom-14 right-0 flex flex-col space-y-2">
          <button
            onClick={handleAddArticle}
            className="flex items-center bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg shadow hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors duration-300 text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            <span>New article</span>
          </button>
          <button
            onClick={handleUploadFile}
            className="flex items-center bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg shadow hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors duration-300 text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Upload file</span>
          </button>
        </div>
      )}
      <button
        onClick={toggleMenu}
        className={`p-3 rounded-full shadow-md focus:outline-none transition-colors duration-300 ${
          isOpen ? 'bg-red-500 dark:bg-red-600 text-white' : 'bg-primary-500 dark:bg-primary-600 text-white'
        }`}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default AddButton;