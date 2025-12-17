import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AdminRole = 'super_admin' | 'vendor_admin' | 'dispatch_admin' | 'user_admin' | 'orders_admin' | 'customer_service';

interface AdminRoleData {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  created_by: string | null;
}

export const useAdminRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching admin role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AdminRole): boolean => {
    if (!userRole) return false;
    if (userRole === 'super_admin') return true; // Super admin has all permissions
    return userRole === role;
  };

  const canAccessVendors = (): boolean => {
    return hasRole('super_admin') || hasRole('vendor_admin');
  };

  const canAccessDispatchers = (): boolean => {
    return hasRole('super_admin') || hasRole('dispatch_admin');
  };

  const canAccessUsers = (): boolean => {
    return hasRole('super_admin') || hasRole('user_admin');
  };

  const canAccessOrders = (): boolean => {
    return hasRole('super_admin') || hasRole('orders_admin');
  };

  const canManageAdmins = (): boolean => {
    return hasRole('super_admin');
  };

  return {
    userRole,
    loading,
    hasRole,
    canAccessVendors,
    canAccessDispatchers,
    canAccessUsers,
    canAccessOrders,
    canManageAdmins,
    refetch: fetchUserRole
  };
};
