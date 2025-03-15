import { useEffect } from 'react';
import { supabase } from '../services/supabase';

const useRealTime = (table, callback) => {
  useEffect(() => {
    const subscription = supabase
      .from(table)
      .on('*', (payload) => {
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [table, callback]);
};

export default useRealTime;
