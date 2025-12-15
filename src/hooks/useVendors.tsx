import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  is_active: boolean;
  is_suspended?: boolean;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  created_at: string;
  updated_at: string;
  subscription_plan?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  product_limit?: number;
  commission_rate?: number;
  has_home_visibility?: boolean;
  free_ads_remaining?: number;
  application_id?: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentVendor = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('approved_vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentVendor(data || null);
    } catch (error) {
      console.error('Error fetching current vendor:', error);
    }
  };

  const toggleVendorStatus = async (vendorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('approved_vendors')
        .update({ is_active: isActive })
        .eq('id', vendorId);

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: `Vendor ${isActive ? 'activated' : 'paused'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('approved_vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchCurrentVendor();
  }, [user]);

  return {
    vendors,
    currentVendor,
    loading,
    toggleVendorStatus,
    deleteVendor,
    refreshVendors: fetchVendors,
    isVendor: !!currentVendor
  };
};