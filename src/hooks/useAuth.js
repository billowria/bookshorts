// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

// Change to named export
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const checkAdminStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        console.log('[Auth] Starting initialization');
        setLoading(true);
        
        const { data: { user: initialUser }, error: sessionError } = 
          await supabase.auth.getUser();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          setUser(initialUser);
          if (initialUser) {
            const adminStatus = await checkAdminStatus(initialUser.id);
            setIsAdmin(adminStatus);
          }
          setLoading(false);
          console.log('[Auth] Initialized:', initialUser ? 'Logged in' : 'No user');
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event);
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            const adminStatus = await checkAdminStatus(currentUser.id);
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
        }
      }
    );
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      navigate('/');
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAdmin
  };
};

// Also add a default export if needed
export default useAuth;
