
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
    const savedAdmin = localStorage.getItem('admin_user');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Hardcoded super admin credentials
      if (email === 'admin@ecomart.com' && password === 'admin123') {
        // Try to sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error('Supabase auth error:', authError);
          // If user doesn't exist, still allow login for backwards compatibility
          // but warn that RLS policies won't work properly
          console.warn('Admin not authenticated with Supabase - data access may be limited');
        }

        const adminUser: AdminUser = {
          id: authData?.user?.id || '1',
          email: 'admin@ecomart.com',
          name: 'Super Admin',
          role: 'super_admin'
        };
        
        setAdmin(adminUser);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        return true;
      }

      // Check against admin_roles table for other admins
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login error:', authError);
        return false;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        console.error('Not an admin user');
        await supabase.auth.signOut();
        return false;
      }

      const adminUser: AdminUser = {
        id: authData.user.id,
        email: authData.user.email || email,
        name: 'Admin User',
        role: roleData.role as 'admin' | 'super_admin'
      };

      setAdmin(adminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
    supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};
