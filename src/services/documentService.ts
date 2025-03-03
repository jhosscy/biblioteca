import { supabase, DOCUMENTS_BUCKET } from '../lib/supabase';
import { format } from 'date-fns';
import { Document } from '../types';

// Maximum file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Converts a Supabase document to our Document type
const transformSupabaseDocument = (record: any): Document => {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    tags: record.tags || [],
    dateAdded: record.date_added,
    favorite: record.favorite,
    category: record.category || '',
    backgroundColor: record.background_color || '#E3F2FD',
    content: record.content,
    storagePath: record.storage_path
  };
};

// List all documents
export const listDocuments = async (): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('date_added', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
    
    return (data || []).map(transformSupabaseDocument);
  } catch (error) {
    console.error('Error in listDocuments:', error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ favorite: isFavorite })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error updating favorite status: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (id: string): Promise<boolean> => {
  try {
    // First get the document to check if it has a storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error(`Error fetching document: ${fetchError.message}`);
    }
    
    // If there's a file in storage, delete it
    if (document?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .remove([document.storage_path]);
      
      if (storageError) {
        console.error(`Error deleting file from storage: ${storageError.message}`);
        // Continue to delete the document record even if storage delete fails
      }
    }
    
    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  }
};

// Check connection status
export const checkConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check if we can connect to Supabase
    // Using count(*) instead of count() to fix the 400 error
    const { error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

// Get article content
export const getArticleContent = async (id: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('content')
      .eq('id', id)
      .eq('type', 'article')
      .single();
    
    if (error) {
      throw new Error(`Error fetching article content: ${error.message}`);
    }
    
    return data?.content || '';
  } catch (error) {
    console.error('Error in getArticleContent:', error);
    throw error;
  }
};

// Get document download URL
export const getDocumentDownloadUrl = async (id: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('storage_path, title')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching document: ${error.message}`);
    }
    
    if (!data?.storage_path) {
      throw new Error('Document does not have an associated file');
    }
    
    const { data: publicUrlData } = supabase.storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(data.storage_path);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in getDocumentDownloadUrl:', error);
    throw error;
  }
};

// Preview document
export const previewDocument = async (id: string): Promise<{ url: string; contentType: string }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('storage_path, type')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching document: ${error.message}`);
    }
    
    let contentType = 'application/octet-stream';
    
    if (data?.type === 'pdf') {
      contentType = 'application/pdf';
    } else if (data?.type === 'image') {
      contentType = 'image/jpeg'; // Default, may be different based on actual image type
    } else if (data?.type === 'markdown') {
      contentType = 'text/markdown';
    } else if (data?.type === 'text') {
      contentType = 'text/plain';
    }
    
    if (data?.storage_path) {
      const { data: publicUrlData } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(data.storage_path);
      
      return { url: publicUrlData.publicUrl, contentType };
    }
    
    // For articles or documents without storage_path
    return { url: '', contentType };
  } catch (error) {
    console.error('Error in previewDocument:', error);
    throw error;
  }
};

// Save an article
export interface SaveArticleParams {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  backgroundColor?: string;
}

export const saveArticle = async (params: SaveArticleParams): Promise<Document> => {
  try {
    const documentData = {
      title: params.title,
      type: 'article',
      tags: params.tags || [],
      date_added: new Date().toISOString(),
      favorite: false,
      category: params.category || null,
      background_color: params.backgroundColor || '#E3F2FD',
      content: params.content
    };
    
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error saving article: ${error.message}`);
    }
    
    return transformSupabaseDocument(data);
  } catch (error) {
    console.error('Error in saveArticle:', error);
    throw error;
  }
};

// Upload a file
export interface UploadParams {
  file: File;
  title: string;
  category?: string;
  tags?: string[];
  backgroundColor?: string;
}

export const uploadFile = async (params: UploadParams, onProgress?: (progress: number) => void): Promise<Document> => {
  try {
    // Determine file type
    let type: 'pdf' | 'doc' | 'article' | 'image' | 'markdown' | 'text' | 'other' = 'other';
    let backgroundColor = params.backgroundColor || '#E3F2FD';
    
    if (params.file.type.includes('pdf')) {
      type = 'pdf';
      backgroundColor = params.backgroundColor || '#FFEBEE';
    } else if (params.file.type.includes('doc')) {
      type = 'doc';
      backgroundColor = params.backgroundColor || '#E8F5E9';
    } else if (params.file.type.includes('image')) {
      type = 'image';
      backgroundColor = params.backgroundColor || '#FFF8E1';
    } else if (params.file.type.includes('markdown') || 
               params.file.name.endsWith('.md') || 
               params.file.name.endsWith('.markdown')) {
      type = 'markdown';
      backgroundColor = params.backgroundColor || '#E1F5FE';
    } else if (params.file.type.includes('text') || 
               params.file.name.endsWith('.txt') || 
               params.file.name.endsWith('.json')) {
      type = 'text';
      backgroundColor = params.backgroundColor || '#F3E5F5';
    }
    
    // Create a unique file name
    const fileExt = params.file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, params.file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress((progress.loaded / progress.total) * 100);
          }
        }
      });
    
    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    // Create document record in database
    const docData = {
      title: params.title,
      type,
      tags: params.tags || [],
      date_added: new Date().toISOString(),
      favorite: false,
      category: params.category || null,
      background_color: backgroundColor,
      storage_path: filePath
    };
    
    const { data, error: documentError } = await supabase
      .from('documents')
      .insert(docData)
      .select()
      .single();
    
    if (documentError) {
      // If there's an error creating the document, try to clean up the uploaded file
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
      throw new Error(`Error creating document record: ${documentError.message}`);
    }
    
    return transformSupabaseDocument(data);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};