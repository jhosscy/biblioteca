import React, { useState } from 'react';
import { Document, ViewMode } from '../types';
import FileCard from './FileCard';
import { LayoutGrid, List, Heart, Trash2 } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

interface FilesViewProps {
  documents: Document[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  title: string;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
}

const FilesView: React.FC<FilesViewProps> = ({ 
  documents, 
  viewMode, 
  setViewMode, 
  title,
  onToggleFavorite,
  onDelete
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const handleToggleFavorite = (document: Document, event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleFavorite(document.id, !document.favorite);
  };

  const handleDelete = (document: Document, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      onDelete(document.id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white transition-colors duration-300">{title}</h2>
        <div className="flex space-x-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors duration-300 ${
              viewMode === 'grid' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors duration-300 ${
              viewMode === 'list' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {documents.map(document => (
            <div 
              key={document.id} 
              className="cursor-pointer group mb-6"
              onClick={() => handleOpenDocument(document)}
            >
              <FileCard document={document} viewMode="grid" />
              <div className="mt-3 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => handleToggleFavorite(document, e)}
                  className={`p-1 rounded-md transition-colors duration-300 ${
                    document.favorite 
                      ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                  aria-label={document.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${document.favorite ? 'fill-red-500 dark:fill-red-400' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDelete(document, e)}
                  className="p-1 text-dark-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-300"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5 pb-16">
          {documents.map(document => (
            <div 
              key={document.id} 
              className="flex items-center group mb-5"
            >
              <div 
                className="flex-grow cursor-pointer"
                onClick={() => handleOpenDocument(document)}
              >
                <FileCard document={document} viewMode="list" />
              </div>
              <div className="flex-shrink-0 flex ml-3 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => handleToggleFavorite(document, e)}
                  className={`p-1 rounded-md transition-colors duration-300 ${
                    document.favorite 
                      ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                  aria-label={document.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${document.favorite ? 'fill-red-500 dark:fill-red-400' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDelete(document, e)}
                  className="p-1 text-dark-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-300"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-12 bg-dark-50 dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700 transition-colors duration-300 mb-16">
          <p className="text-dark-500 dark:text-dark-400 text-sm">No documents to display</p>
        </div>
      )}

      <DocumentViewer 
        document={selectedDocument}
        visible={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

export default FilesView;