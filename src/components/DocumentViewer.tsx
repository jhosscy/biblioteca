import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, File, Image } from 'lucide-react';
import { Document as DocumentType } from '../types';
import { getDocumentDownloadUrl, previewDocument, getArticleContent } from '../services/documentService';
import { useTheme } from '../contexts/ThemeContext';
import { marked } from 'marked';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set PDF.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  document: DocumentType | null;
  visible: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, visible, onClose }) => {
  const { isDarkMode } = useTheme();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  // Control body scroll when the modal is open
  useEffect(() => {
    // Safely handle body overflow
    const controlBodyOverflow = (shouldPreventScroll: boolean) => {
      try {
        if (typeof window !== 'undefined' && window.document && window.document.body) {
          window.document.body.style.overflow = shouldPreventScroll ? 'hidden' : '';
        }
      } catch (e) {
        console.error('Failed to control body overflow:', e);
      }
    };

    if (visible) {
      controlBodyOverflow(true);
    }
    
    return () => {
      controlBodyOverflow(false);
    };
  }, [visible]);

  useEffect(() => {
    if (visible && document) {
      loadDocument();
    } else {
      resetState();
    }
  }, [visible, document]);

  const resetState = () => {
    setPreviewUrl(null);
    setDownloadUrl(null);
    setFileContent(null);
    setContentType('');
    setError(null);
    setNumPages(null);
    setPageNumber(1);
  };

  const loadDocument = async () => {
    if (!document) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Handle different document types
      if (document.type === 'article') {
        // For articles, get only the content - no file download needed
        const contentResult = await getArticleContent(document.id);
        
        // Handle different response formats
        if (typeof contentResult === 'string') {
          setFileContent(contentResult);
          setContentType('text/plain');
        } else if (contentResult && typeof contentResult === 'object') {
          if ('error' in contentResult) {
            setError(contentResult.error);
          } else if (contentResult.content) {
            setFileContent(contentResult.content);
            setContentType('text/plain');
          }
        }
      } else {
        // For non-article documents, get download URL
        const downloadResult = await getDocumentDownloadUrl(document.id);
        setDownloadUrl(downloadResult);

        // Also get preview URL and content for non-article documents
        const previewResult = await previewDocument(document.id);
        
        if (typeof previewResult === 'object') {
          if ('error' in previewResult) {
            setError(previewResult.error);
          } else if ('url' in previewResult) {
            setPreviewUrl(previewResult.url);
            
            // Set content type based on document type
            if (document.type === 'pdf') {
              setContentType('application/pdf');
            } else if (document.type === 'image') {
              setContentType('image/jpeg');
            } else if (document.type.includes('markdown') || document.storagePath?.endsWith('.md')) {
              setContentType('text/markdown');
              // Fetch markdown content
              try {
                const response = await fetch(previewResult.url);
                if (response.ok) {
                  const text = await response.text();
                  setFileContent(text);
                }
              } catch (err) {
                console.error("Error fetching markdown content:", err);
              }
            } else if (document.type.includes('text') || 
                      document.storagePath?.endsWith('.txt') || 
                      document.storagePath?.endsWith('.json')) {
              setContentType('text/plain');
              // Fetch text content
              try {
                const response = await fetch(previewResult.url);
                if (response.ok) {
                  const text = await response.text();
                  setFileContent(text);
                }
              } catch (err) {
                console.error("Error fetching text content:", err);
              }
            } else {
              setContentType(previewResult.contentType || 'application/octet-stream');
            }
          }
        }
      }
    } catch (err) {
      setError('Error loading document');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const nextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prevPageNumber => prevPageNumber - 1);
    }
  };

  // Get the appropriate icon based on content type
  const getDocumentIcon = () => {
    if (!document) return null;
    
    switch(document.type) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-500 dark:text-red-400" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500 dark:text-green-400" />;
      default:
        return <FileText className="h-8 w-8 text-primary-500 dark:text-primary-400" />;
    }
  };

  // Render content based on content type
  const renderContent = () => {
    if (!document) return null;
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400">
          <p>Error: {error}</p>
          <button 
            onClick={loadDocument}
            className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      );
    }

    // For articles or markdown
    if (fileContent) {
      if (contentType === 'text/markdown') {
        const html = marked(fileContent, { breaks: true });
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: html }} 
            className="markdown-content prose prose-sm dark:prose-invert max-w-none transition-colors duration-300" 
          />
        );
      } else {
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none transition-colors duration-300">
            <div className="whitespace-pre-wrap">{fileContent}</div>
          </div>
        );
      }
    }
    
    // For PDFs and images
    if (previewUrl) {
      if (document.type === 'image') {
        return (
          <div className="h-full flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt={document.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );
      } else if (document.type === 'pdf') {
        return (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-auto">
              <PDFDocument 
                file={previewUrl} 
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  scale={1.2}
                />
              </PDFDocument>
            </div>
            {numPages && numPages > 1 && (
              <div className="flex justify-between items-center p-3 border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 transition-colors duration-300">
                <button 
                  onClick={prevPage}
                  disabled={pageNumber <= 1}
                  className={`px-3 py-1 rounded-md ${
                    pageNumber <= 1 
                    ? 'text-dark-400 dark:text-dark-600 cursor-not-allowed' 
                    : 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-500'
                  } transition-colors duration-300`}
                >
                  Previous
                </button>
                <p className="text-dark-700 dark:text-dark-300 transition-colors duration-300">
                  Page {pageNumber} of {numPages}
                </p>
                <button 
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  className={`px-3 py-1 rounded-md ${
                    pageNumber >= numPages 
                    ? 'text-dark-400 dark:text-dark-600 cursor-not-allowed' 
                    : 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-500'
                  } transition-colors duration-300`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      }
    }
    
    // Fallback for unsupported or unavailable content
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mb-4">
          {getDocumentIcon()}
        </div>
        <p className="text-dark-500 dark:text-dark-400 mb-4 transition-colors duration-300">
          {downloadUrl 
            ? 'Preview is not available for this document type.' 
            : 'Cannot access the content of this document.'}
        </p>
        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 flex items-center transition-colors duration-300"
          >
            <Download className="h-5 w-5 mr-2" />
            Download document
          </button>
        )}
      </div>
    );
  };

  if (!visible || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b border-dark-200 dark:border-dark-700">
          <div>
            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">{document.title}</h2>
            {document.category && (
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Category: {document.category}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {downloadUrl && (
              <button
                onClick={handleDownload}
                className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors duration-300"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            {previewUrl && (
              <button
                onClick={handleOpenExternal}
                className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors duration-300"
                title="Open in new tab"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-md transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-grow overflow-y-auto p-4 transition-colors duration-300">
          {renderContent()}
        </div>
        
        {/* Footer - Fixed */}
        {document.tags && document.tags.length > 0 && (
          <div className="px-4 py-3 border-t border-dark-200 dark:border-dark-700 transition-colors duration-300">
            <div className="flex flex-wrap gap-1">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-800 dark:text-dark-300 transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;