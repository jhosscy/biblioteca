import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, File, Palette } from 'lucide-react';
import { uploadFile, UploadParams } from '../services/documentService';
import ColorPicker from './ColorPicker';
import { Document, UploadProgressInfo } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (document: Document) => void;
}

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const UploadModal: React.FC<UploadModalProps> = ({ visible, onClose, onUpload }) => {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#E3F2FD'); // Default light blue color
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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
    setSelectedFile(null);
    setCategory('');
    setTags('');
    setBackgroundColor('#E3F2FD');
    setShowColorPicker(false);
    setUploadProgress(0);
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        setError(`File exceeds the 10MB limit`);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md', '.markdown'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: MAX_FILE_SIZE
  });

  const handleSubmit = async () => {
    if (!title.trim() || !selectedFile) {
      setError('Title and file are required');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Prepare the upload object
      const uploadParams: UploadParams = {
        file: selectedFile,
        title: title.trim(),
        category: category.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        backgroundColor: backgroundColor
      };

      // Upload the file to Supabase
      const result = await uploadFile(uploadParams, (progress) => {
        setUploadProgress(progress);
      });

      onUpload(result);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.includes('image')) {
      return <Image className="h-12 w-12 text-green-500 dark:text-green-400" />;
    } else if (selectedFile.type.includes('pdf')) {
      return <File className="h-12 w-12 text-red-500 dark:text-red-400" />;
    } else {
      return <FileText className="h-12 w-12 text-primary-500 dark:text-primary-400" />;
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-800 dark:text-white">Upload File</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 rounded-md hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors duration-300"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 transition-colors duration-300">
              Document Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-300"
              placeholder="Enter a title for your document"
              disabled={isUploading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 transition-colors duration-300">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-300"
              placeholder="E.g., Design, Technology, Art"
              disabled={isUploading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 transition-colors duration-300">
              Tags (separated by commas)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-300"
              placeholder="E.g., design, architecture, reference"
              disabled={isUploading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 transition-colors duration-300">
              Background Color
            </label>
            <div className="flex items-center relative">
              <div 
                className="flex items-center p-2 border border-dark-300 dark:border-dark-600 rounded-md w-full cursor-pointer bg-white dark:bg-dark-700 transition-colors duration-300"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <div 
                  className="w-6 h-6 rounded-md border border-dark-300 dark:border-dark-600 mr-2 transition-colors duration-300"
                  style={{ backgroundColor: backgroundColor }}
                />
                <Palette className="h-4 w-4 mr-2 text-dark-500 dark:text-dark-400" />
                <span className="text-sm text-dark-700 dark:text-dark-300 transition-colors duration-300">
                  {backgroundColor}
                </span>
              </div>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-10">
                  <ColorPicker onSelectColor={handleColorSelect} />
                </div>
              )}
            </div>
          </div>

          <div 
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
              isDragActive ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600' : 'border-dark-300 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-600'
            } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''} bg-white dark:bg-dark-700`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                {getFileIcon()}
                <p className="mt-2 text-sm text-dark-900 dark:text-white font-medium transition-colors duration-300">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-dark-500 dark:text-dark-400 transition-colors duration-300">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-300"
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-dark-400 dark:text-dark-500" />
                <p className="mt-2 text-sm text-dark-600 dark:text-dark-400 transition-colors duration-300">
                  Drag and drop a file here, or{' '}
                  <span className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-300">
                    select a file
                  </span>
                </p>
                <p className="mt-1 text-xs text-dark-500 dark:text-dark-500 transition-colors duration-300">
                  PDF, TXT, MD, DOC, DOCX, JPG, PNG, GIF (max. 10MB)
                </p>
              </>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 transition-colors duration-300">Uploading file...</p>
              <div className="w-full bg-dark-200 dark:bg-dark-600 rounded-full h-2.5 transition-colors duration-300">
                <div 
                  className="bg-primary-500 dark:bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-dark-500 dark:text-dark-400 text-right mt-1 transition-colors duration-300">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className={`px-4 py-2 bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-md mr-2 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors duration-300 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || !selectedFile || isUploading}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                title && selectedFile && !isUploading
                  ? 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                  : 'bg-primary-300 dark:bg-primary-700/50 text-white cursor-not-allowed'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;