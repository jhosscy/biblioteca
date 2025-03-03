import React, { useState, useEffect } from 'react';
import { Document, ViewMode, CurrentSection, FilterOptions } from './types';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import FilesView from './components/FilesView';
import Sidebar from './components/Sidebar';
import AddButton from './components/AddButton';
import Editor from './components/Editor';
import UploadModal from './components/UploadModal';
import { FilterIcon, AlertCircle } from 'lucide-react';
import { listDocuments, toggleFavorite, deleteDocument, checkConnection } from './services/documentService';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentSection, setCurrentSection] = useState<CurrentSection>('files');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    categories: [],
    timeframe: 'all',
    tags: []
  });

  // Load documents when starting the application
  useEffect(() => {
    checkConnectionStatus();
    fetchDocuments();
  }, []);

  // Filter documents based on current section, search and filters
  useEffect(() => {
    let filtered = [...documents];
    
    // Filter by section
    if (currentSection === 'favorites') {
      filtered = filtered.filter(doc => doc.favorite);
    } else if (currentSection === 'articles') {
      filtered = filtered.filter(doc => doc.type === 'article');
    } else if (currentSection === 'recent') {
      // Sort by most recent date
      filtered = filtered.sort((a, b) => 
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      ).slice(0, 6); // Show only the 6 most recent
    }
    
    // Apply search if it exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) || 
        doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (doc.category && doc.category.toLowerCase().includes(query))
      );
    }
    
    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(doc => 
        filters.types.includes(doc.type) || filters.types.includes('all')
      );
    }
    
    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(doc => 
        filters.categories.includes(doc.category) || 
        filters.categories.includes('all') ||
        (filters.categories.includes('uncategorized') && !doc.category)
      );
    }
    
    // Apply tag filters
    if (filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        doc.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Apply time filter
    if (filters.timeframe !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.dateAdded).getTime();
        
        switch (filters.timeframe) {
          case 'today':
            return docDate >= today;
          case 'thisWeek':
            const weekAgo = today - (7 * 24 * 60 * 60 * 1000);
            return docDate >= weekAgo;
          case 'thisMonth':
            const monthAgo = today - (30 * 24 * 60 * 60 * 1000);
            return docDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredDocuments(filtered);
  }, [currentSection, searchQuery, documents, filters]);

  const checkConnectionStatus = async () => {
    const connected = await checkConnection();
    setIsConnected(connected);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load data from Supabase
      const result = await listDocuments();
      setDocuments(result);
    } catch (err) {
      setError('Error loading documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddArticle = () => {
    setIsEditorVisible(true);
  };

  const handleUploadFile = () => {
    setIsUploadModalVisible(true);
  };

  const handleSaveArticle = (newDocument: Document) => {
    setDocuments(prevDocs => [newDocument, ...prevDocs]);
    setIsEditorVisible(false);
  };

  const handleUpload = (newDocument: Document) => {
    setDocuments(prevDocs => [newDocument, ...prevDocs]);
    setIsUploadModalVisible(false);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      // Call Supabase service
      const result = await toggleFavorite(id, isFavorite);
      
      if (result === true) {
        // Update state locally for faster response
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === id ? { ...doc, favorite: isFavorite } : doc
          )
        );
      }
    } catch (err) {
      console.error('Error changing favorite:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      // Call Supabase service
      const result = await deleteDocument(id);
      
      if (result === true) {
        // Remove document from state
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'files':
        return 'My Files';
      case 'articles':
        return 'My Articles';
      case 'favorites':
        return 'Favorites';
      case 'recent':
        return 'Recent';
      default:
        return 'My Files';
    }
  };
  
  // Get all available categories from documents
  const getAvailableCategories = () => {
    const categories = documents
      .map(doc => doc.category)
      .filter((category): category is string => Boolean(category));
    
    // Remove duplicates
    return ['all', ...new Set(categories), 'uncategorized'];
  };
  
  // Get all available tags from documents
  const getAvailableTags = () => {
    const tags = documents.flatMap(doc => doc.tags);
    // Remove duplicates
    return [...new Set(tags)];
  };

  // Connection error message
  const ConnectionError = () => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6 flex items-start">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
      <div>
        <h3 className="font-medium text-red-800 dark:text-red-300">Connection Problem</h3>
        <p className="text-red-700 dark:text-red-400 text-sm mt-1">
          Could not connect to the database. Check your internet connection or try again later.
        </p>
        <button 
          onClick={checkConnectionStatus}
          className="mt-2 px-3 py-1 bg-red-600 dark:bg-red-700 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-dark-900 dark:text-dark-50 transition-colors duration-300">
        <Navbar 
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <div className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch} 
              searchQuery={searchQuery}
            />
          </div>
          
          {!isConnected && <ConnectionError />}
          
          <div className="flex flex-col lg:flex-row">
            {/* Mobile filter button - Only visible on mobile */}
            <div className="lg:hidden mb-4">
              <button
                className="p-2 flex items-center border dark:border-dark-700 rounded-md transition-colors duration-300 dark:hover:bg-dark-800 hover:bg-gray-100"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              >
                <FilterIcon className="h-5 w-5 mr-2" />
                <span>Filters</span>
              </button>
            </div>
            
            {/* Sidebar - Mobile (Drawer) */}
            <Sidebar 
              visible={isSidebarVisible} 
              onClose={() => setIsSidebarVisible(false)}
              isMobile={true}
              filters={filters}
              setFilters={setFilters}
              availableCategories={getAvailableCategories()}
              availableTags={getAvailableTags()}
            />
            
            {/* Sidebar - Desktop (Fixed) */}
            <div className="hidden lg:block lg:w-56 lg:mr-8 flex-shrink-0">
              <Sidebar 
                visible={true} 
                onClose={() => {}}
                isMobile={false}
                filters={filters}
                setFilters={setFilters}
                availableCategories={getAvailableCategories()}
                availableTags={getAvailableTags()}
              />
            </div>
            
            {/* Main content */}
            <div className="flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 dark:border-primary-400"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-700 dark:text-red-400">
                  <p>Error: {error}</p>
                  <button 
                    onClick={fetchDocuments}
                    className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <FilesView 
                  documents={filteredDocuments}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  title={getSectionTitle()}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteDocument}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Floating button to add content */}
        <AddButton 
          onAddArticle={handleAddArticle}
          onUploadFile={handleUploadFile}
        />
        
        {/* Text editor */}
        <Editor 
          visible={isEditorVisible}
          onClose={() => setIsEditorVisible(false)}
          onSave={handleSaveArticle}
        />
        
        {/* File upload modal */}
        <UploadModal
          visible={isUploadModalVisible}
          onClose={() => setIsUploadModalVisible(false)}
          onUpload={handleUpload}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;