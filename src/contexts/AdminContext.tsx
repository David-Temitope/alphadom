
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
    // Check Supabase session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('admin_roles')
          .select('*, profiles!inner(full_name)')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (roleData) {
          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: (roleData.profiles as any)?.full_name || 'Admin User',
            role: roleData.role as 'admin' | 'super_admin'
          });
        }
      }
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: roleData } = await supabase
          .from('admin_roles')
          .select('*, profiles!inner(full_name)')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (roleData) {
          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: (roleData.profiles as any)?.full_name || 'Admin User',
            role: roleData.role as 'admin' | 'super_admin'
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return false;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('*, profiles!inner(full_name)')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        return false;
      }

      const adminUser: AdminUser = {
        id: authData.user.id,
        email: authData.user.email || email,
        name: (roleData.profiles as any)?.full_name || 'Admin User',
        role: roleData.role as 'admin' | 'super_admin'
      };

      setAdmin(adminUser);
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
