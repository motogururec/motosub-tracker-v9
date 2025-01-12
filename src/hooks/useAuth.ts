import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            // First check if profile exists
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', currentUser.id)
              .single();

            // Only create profile if it doesn't exist
            if (!existingProfile) {
              await supabase
                .from('user_profiles')
                .insert([{
                  id: currentUser.id,
                  preferences: {
                    notifications_enabled: true,
                    language: 'en',
                    theme: 'system',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  }
                }]);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signOut };
}