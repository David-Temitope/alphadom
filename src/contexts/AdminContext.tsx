
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session on mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Verify admin role from database
        const { data: roleData } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (roleData) {
          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: 'Admin User',
            role: roleData.role as 'admin' | 'super_admin'
          });
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setAdmin(null);
      } else if (session?.user) {
        const { data: roleData } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (roleData) {
          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: 'Admin User',
            role: roleData.role as 'admin' | 'super_admin'
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Only use Supabase authentication - no hardcoded credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return false;
      }

      // Verify admin role server-side
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        return false;
      }

      // Set admin state (no localStorage)
      setAdmin({
        id: authData.user.id,
        email: authData.user.email || email,
        name: 'Admin User',
        role: roleData.role as 'admin' | 'super_admin'
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};
