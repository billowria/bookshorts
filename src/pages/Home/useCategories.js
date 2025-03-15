import { useEffect, useState } from 'react';
import { supabase }  from '../../services/supabase';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        setError(error);
      } else {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useCategories;
