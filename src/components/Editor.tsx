import React, { useState, useEffect } from 'react';
import { Save, X, Palette } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { saveArticle } from '../services/documentService';
import { useTheme } from '../contexts/ThemeContext';

interface EditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (document: any) => void;
}

const Editor: React.FC<EditorProps> = ({ visible, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#E3F2FD'); // Default light blue color
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Control body scroll when the modal is open
  useEffect(() => {
    // Verify we're in a browser environment and document is available
    if (typeof document !== 'undefined' && visible) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Restore body scroll when component unmounts or modal closes
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setTags('');
    setBackgroundColor('#E3F2FD');
    setShowColorPicker(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color);
    setShowColorPicker(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveArticle({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        backgroundColor: backgroundColor
      });

      onSave(result);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving the article');
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-800 dark:text-white">New Article</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-3 py-1.5 rounded-md transition-colors duration-300 ${
                isSaving
                  ? 'bg-primary-300 dark:bg-primary-700/50 text-white cursor-not-allowed'
                  : 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
              }`}
            >
              <Save className="h-4 w-4 mr-1" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleClose}
              disabled={isSaving}
              className={`p-1.5 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors duration-300 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-grow overflow-y-auto p-4">
          <input
            type="text"
            placeholder="Article title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-medium border-0 border-b-2 border-dark-200 dark:border-dark-700 p-2 mb-4 
              focus:outline-none focus:border-primary-500 dark:focus:border-primary-400
              bg-transparent text-dark-900 dark:text-white
              placeholder-dark-400 dark:placeholder-dark-500
              transition-colors duration-300"
            disabled={isSaving}
          />
          
          <div className="flex flex-col sm:flex-row mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Category (e.g. Technology, Art)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border-0 border-b-2 border-dark-200 dark:border-dark-700 p-2 
                  focus:outline-none focus:border-primary-500 dark:focus:border-primary-400
                  bg-transparent text-dark-900 dark:text-white
                  placeholder-dark-400 dark:placeholder-dark-500
                  transition-colors duration-300"
                disabled={isSaving}
              />
            </div>
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Tags (separated by commas)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full text-sm border-0 border-b-2 border-dark-200 dark:border-dark-700 p-2 
                  focus:outline-none focus:border-primary-500 dark:focus:border-primary-400
                  bg-transparent text-dark-900 dark:text-white
                  placeholder-dark-400 dark:placeholder-dark-500
                  transition-colors duration-300"
                disabled={isSaving}
              />
            </div>
            <div className="w-full sm:w-1/3 relative">
              <div className="flex items-center cursor-pointer border-0 border-b-2 border-dark-200 dark:border-dark-700 p-2 transition-colors duration-300" 
                   onClick={() => setShowColorPicker(!showColorPicker)}>
                <Palette className="h-4 w-4 mr-2 text-dark-500 dark:text-dark-400" />
                <div 
                  className="w-6 h-6 rounded-md border border-dark-300 dark:border-dark-600 mr-2"
                  style={{ backgroundColor: backgroundColor }}
                />
                <span className="text-sm text-dark-700 dark:text-dark-300 truncate">
                  Background color
                </span>
              </div>
              {showColorPicker && (
                <div className="absolute z-10 mt-1 right-0">
                  <ColorPicker onSelectColor={handleColorSelect} />
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          
          <textarea
            placeholder="Start writing here... *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-2 focus:outline-none resize-none font-light 
              text-dark-700 dark:text-dark-300 leading-relaxed 
              border border-dark-300 dark:border-dark-600 rounded-md
              bg-white dark:bg-dark-700
              placeholder-dark-400 dark:placeholder-dark-500
              transition-colors duration-300"
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;