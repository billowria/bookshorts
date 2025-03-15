import { supabase } from '../services/supabase';

const processBulkData = async (data) => {
  // Iterate over categories
  for (const category of data.categories) {
    const { error: catError } = await supabase
      .from('Categories')
      .upsert({
        id: category.id,
        name: category.name,
        display_order: category.display_order,
      });

    if (catError) {
      console.error('Error inserting category:', catError);
      throw catError;
    }

    // Insert books for this category
    for (const book of category.books) {
      const { error: bookError } = await supabase
        .from('Books')
        .upsert({
          id: book.id,
          category_id: category.id,
          title: book.title,
          cover_image: book.cover_image,
          display_order: book.display_order,
        });

      if (bookError) {
        console.error('Error inserting book:', bookError);
        throw bookError;
      }

      // Insert content for this book
      for (const content of book.content) {
        const { error: contentError } = await supabase
          .from('Content')
          .upsert({
            book_id: book.id,
            type: content.type,
            content: content.content,
          });

        if (contentError) {
          console.error('Error inserting content:', contentError);
          throw contentError;
        }
      }
    }
  }
};

export default processBulkData;
