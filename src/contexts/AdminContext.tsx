import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Using production-safe logger to prevent information disclosure in production logs
import { logger } from '@/utils/logger';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'vendor_admin' | 'dispatch_admin' | 'user_admin' | 'orders_admin';
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkAdminStatus: () => Promise<void>;
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

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has admin role
        const { data: roleData, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          logger.error('Error checking admin role:', error);
          setAdmin(null);
          return;
        }

        if (roleData) {
          // Get profile name
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();

          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: profileData?.full_name || 'Admin User',
            role: roleData.role as AdminUser['role']
          });
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (error) {
      logger.error('Error in checkAdminStatus:', error);
      setAdmin(null);
    }
  };

  useEffect(() => {
    // Check admin status on mount
    const initAdmin = async () => {
      await checkAdminStatus();
      setIsLoading(false);
    };

    initAdmin();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to avoid deadlock
        setTimeout(() => {
          checkAdminStatus();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const trackLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.rpc('track_admin_login_attempt', {
        _email: email,
        _success: success,
        _ip_address: null // IP tracking handled server-side if needed
      });
    } catch (error) {
      // Silently fail - don't block login flow for tracking errors
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Track failed login attempt via secure function
        await trackLoginAttempt(email, false);
        return false;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (roleError) {
        await trackLoginAttempt(email, false);
        await supabase.auth.signOut();
        return false;
      }

      if (!roleData) {
        await trackLoginAttempt(email, false);
        await supabase.auth.signOut();
        return false;
      }

      // Track successful login
      await trackLoginAttempt(email, true);

      // Get profile name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authData.user.id)
        .maybeSingle();

      const adminUser: AdminUser = {
        id: authData.user.id,
        email: authData.user.email || email,
        name: profileData?.full_name || 'Admin User',
        role: roleData.role as AdminUser['role']
      };

      setAdmin(adminUser);
      return true;
    } catch (error) {
      await trackLoginAttempt(email, false);
      return false;
    }
  };

  const logout = async () => {
    setAdmin(null);
    await supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};