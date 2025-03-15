// src/hooks/useBookData.js
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} category_id
 * @property {string} title
 * @property {string} cover_image
 * @property {number} display_order
 * @property {boolean} status
 * @property {import('./types').Category} category
 */

/**
 * @typedef {Object} Content
 * @property {string} id
 * @property {string} book_id
 * @property {'core' | 'deep_dive'} type
 * @property {string} content
 * @property {Date} last_updated
 */

/**
 * @typedef {Object} BookData
 * @property {Book | null} book
 * @property {Content | null} content
 * @property {boolean} loading
 * @property {Error | null} error
 */

/**
 * Hook to fetch book data and associated content
 * @param {string} bookId 
 * @param {'core' | 'deep_dive'} section 
 * @returns {Object} Book data, content, loading state, and error
 */
const useBookData = (bookId, section) => {
  const [state, setState] = useState({
    book: null,
    content: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Parallel requests for better performance
        const [bookQuery, contentQuery] = await Promise.all([
          supabase
            .from('Books')
            .select(`
              *,
              category:Categories (
                id,
                name,
                display_order,
                status
              )
            `)
            .eq('id', bookId)
            .single(),

          supabase
            .from('Content')
            .select('*')
            .eq('book_id', bookId)
            .eq('type', section)
            .single()
        ]);

        // Handle errors
        const error = bookQuery.error || contentQuery.error;
        if (error) throw error;

        // Validate response structure
        if (!bookQuery.data) throw new Error('Book not found');
        
        // For content, we'll be more lenient - if not found, we'll just have empty content
        const contentData = contentQuery.data || { content: '', type: section, last_updated: new Date() };
        
        // Make sure the content field is a string, not an object
        if (contentData.content && typeof contentData.content === 'object') {
          console.warn('Content is an object, not a string. Converting to JSON string.');
          contentData.content = JSON.stringify(contentData.content);
        }
        
        // Default content to empty string if null/undefined
        if (!contentData.content) {
          contentData.content = '';
        }

        setState({
          book: {
            ...bookQuery.data,
            category: bookQuery.data.category || null,
            cover_image: bookQuery.data.cover_image || '/placeholder-cover.jpg',
            status: bookQuery.data.status ?? true
          },
          content: {
            ...contentData,
            content: String(contentData.content), // Ensure content is a string
            last_updated: contentData.last_updated ? new Date(contentData.last_updated) : new Date()
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Book data fetch error:', error);
        setState({
          book: null,
          content: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to load book data')
        });
      }
    };

    if (bookId) fetchData();
  }, [bookId, section]);

  return state;
};

export default useBookData;