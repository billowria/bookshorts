import { supabase } from './supabase';

export const fetchContent = async (bookId, type) => {
  const { data, error } = await supabase
    .from('Content')
    .select('content')
    .eq('book_id', bookId)
    .eq('type', type)
    .single();

  if (error) {
    throw error;
  }
  return data.content;
};

export const updateContent = async (contentId, newContent) => {
  const { data, error } = await supabase
    .from('Content')
    .update({ content: newContent })
    .eq('id', contentId);
    
  if (error) {
    throw error;
  }
  return data;
};
