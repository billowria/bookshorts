import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client...');

// Create Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          console.log(`[Auth Storage] Getting ${key}:`, value ? 'Found' : 'Not found');
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('[Auth Storage] Get error:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          console.log(`[Auth Storage] Set ${key}`);
        } catch (error) {
          console.error('[Auth Storage] Set error:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          console.log(`[Auth Storage] Removed ${key}`);
        } catch (error) {
          console.error('[Auth Storage] Remove error:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Add a session initialization promise
let sessionInitialized = false;
let sessionInitPromise = null;

export const initializeSession = async () => {
  if (sessionInitialized) return;
  
  if (!sessionInitPromise) {
    sessionInitPromise = new Promise(async (resolve) => {
      try {
        console.log('[Session] Initializing...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log('[Session] Initialized:', session ? 'Active' : 'None');
        sessionInitialized = true;
        resolve(session);
      } catch (error) {
        console.error('[Session] Init error:', error);
        sessionInitialized = true;
        resolve(null);
      }
    });
  }
  
  return sessionInitPromise;
};

// Function to fetch categories with error handling
export const fetchCategories = async () => {
  try {
    console.log('[Categories] Waiting for session...');
    await initializeSession();
    
    console.log('[Categories] Fetching...');
    const { data, error } = await supabase
      .from('Categories')
      .select('id, name, display_order, status, image_url, click_count')
      .eq('status', true)
      .order('display_order', { ascending: true })
      .limit(6);

    if (error) {
      console.error('fetchCategories: Error:', error);
      throw error;
    }
    
    console.log('fetchCategories: Success');
    return { data, error: null };
  } catch (error) {
    console.error('fetchCategories: Error:', error);
    return { data: null, error };
  }
};

// Function to fetch featured books with error handling
export const fetchFeaturedBooks = async () => {
  try {
    console.log('fetchFeaturedBooks: Starting fetch', supabase);
    const { data, error } = await supabase
      .from('Books')
      .select(`
        id, 
        title, 
        cover_image, 
        status,
        avg_rating,
        click_count,
        category_id,
        Categories (
          name
        )
      `)
      .eq('status', true)
      .order('avg_rating', { ascending: false })
      .limit(5);

    if (error) {
      console.error('fetchFeaturedBooks: Error:', error);
      throw error;
    }
    
    console.log('fetchFeaturedBooks: Success');
    return { data, error: null };
  } catch (error) {
    console.error('fetchFeaturedBooks: Error:', error);
    return { data: null, error };
  }
};

// Function to fetch Likhari categories
export const fetchLikhariCategories = async () => {
  try {
    console.log('[Likhari Categories] Waiting for session...');
    await initializeSession();
    
    console.log('[Likhari Categories] Fetching...');
    const { data, error } = await supabase
      .from('likhari_categories')
      .select('id, name, description, image_url, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('fetchLikhariCategories: Error:', error);
      throw error;
    }
    
    console.log('fetchLikhariCategories: Success');
    return { data, error: null };
  } catch (error) {
    console.error('fetchLikhariCategories: Error:', error);
    return { data: null, error };
  }
};

// Function to fetch featured Likhari books
export const fetchFeaturedLikhariBooks = async () => {
  try {
    console.log('fetchFeaturedLikhariBooks: Starting fetch', supabase);
    const { data, error } = await supabase
      .from('likhari_books')
      .select(`
        id, 
        title, 
        cover_image_url, 
        status,
        excerpt,
        category_id,
        category:category_id (
          name
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('fetchFeaturedLikhariBooks: Error:', error);
      throw error;
    }
    
    console.log('fetchFeaturedLikhariBooks: Success');
    return { data, error: null };
  } catch (error) {
    console.error('fetchFeaturedLikhariBooks: Error:', error);
    return { data: null, error };
  }
};

// Function to add a new category
export const addCategory = async (categoryData) => {
  try {
    const { name, display_order } = categoryData;
    const { data, error } = await supabase
      .from('Categories')
      .insert([{ 
        name, 
        display_order,
        status: true 
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding category:', error);
    return { data: null, error };
  }
};

// Function to upload book cover image
export const uploadCoverImage = async (file) => {
  try {
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(`covers/${file.name}`, file);

    if (error) throw error;
    return { data: data.path, error: null };
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return { data: null, error };
  }
};

// Function to add a new book
export const addBook = async (bookData) => {
  try {
    const { data, error } = await supabase
      .from('Books')
      .insert([bookData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding book:', error);
    return { data: null, error };
  }
};

// Function to add Core/Deep Dive content
export const addContent = async (contentData) => {
  try {
    const { data, error } = await supabase
      .from('Content')
      .insert([contentData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding content:', error);
    return { data: null, error };
  }
};

// Function to track book clicks
export const incrementBookClicks = async (bookId) => {
  try {
    const { data, error } = await supabase.rpc('increment_book_clicks', { book_id: bookId });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error incrementing book clicks:', error);
    return { data: null, error };
  }
};

// Function to track category clicks
export const incrementCategoryClicks = async (categoryId) => {
  try {
    const { data, error } = await supabase.rpc('increment_category_clicks', { category_id: categoryId });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error incrementing category clicks:', error);
    return { data: null, error };
  }
};

// Function to rate a book
export const rateBook = async (bookId, userId, rating) => {
  try {
    // Insert or update rating
    const { data, error } = await supabase
      .from('Ratings')
      .upsert({
        book_id: bookId,
        user_id: userId,
        rating: rating
      })
      .select()
      .single();

    if (error) throw error;

    // Update book's average rating
    await supabase.rpc('update_book_rating', { book_id: bookId });

    return { data, error: null };
  } catch (error) {
    console.error('Error rating book:', error);
    return { data: null, error };
  }
};

// Function to get user's bookmarks
export const getUserBookmarks = async (userId) => {
  try {
    console.log('Fetching bookmarks for user:', userId);
    
    // Implement retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('Bookmarks')
          .select(`
            id,
            created_at,
            Books (
              id,
              title,
              cover_image,
              avg_rating,
              category_id,
              Categories (
                name
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log(`Successfully fetched ${data?.length || 0} bookmarks`);
        return { data, error: null };
      } catch (error) {
        lastError = error;
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, error);
        
        if (retryCount < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('All bookmark fetch attempts failed:', lastError);
    return { data: [], error: lastError };
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return { data: [], error };
  }
};

// Function to toggle bookmark (client-side implementation)
export const toggleBookmark = async (bookId, userId) => {
  try {
    console.log('Toggling bookmark for book:', bookId, 'user:', userId);
    
    // Check if bookmark exists
    const { data: existing, error: checkError } = await supabase
      .from('Bookmarks')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Remove bookmark
      console.log('Removing existing bookmark');
      const { error: deleteError } = await supabase
        .from('Bookmarks')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      return { data: { action: 'removed' }, error: null };
    } else {
      // Add bookmark
      console.log('Adding new bookmark');
      const { data, error } = await supabase
        .from('Bookmarks')
        .insert([{ book_id: bookId, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return { data: { ...data, action: 'added' }, error: null };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { data: null, error };
  }
};
