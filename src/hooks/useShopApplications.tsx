import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ShopApplication {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  price_range_min: number;
  price_range_max: number;
  email: string;
  bank_details: any; // Using any for JSON fields from database
  business_description?: string;
  contact_phone?: string;
  business_address?: string;
  status: string; // Allow any string status from database
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  payment_due_date?: string;
  payment_received_at?: string;
  payment_countdown_expires_at?: string;
}

export const useShopApplications = () => {
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [userApplication, setUserApplication] = useState<ShopApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shop applications",
        variant: "destructive",
      });
    }
  };

  const fetchUserApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shop_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserApplication((data as any) || null);
    } catch (error) {
      console.error('Error fetching user application:', error);
    }
  };

  const submitApplication = async (applicationData: Omit<ShopApplication, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('shop_applications')
        .insert({
          user_id: user.id,
          ...applicationData
        })
        .select()
        .single();

      if (error) throw error;

      setUserApplication(data as any);
      toast({
        title: "Success",
        description: "Shop application submitted successfully!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, adminNotes?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.payment_due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
        updateData.payment_countdown_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days countdown
      }

      if (status === 'payment') {
        updateData.payment_received_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('shop_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // If approved and payment received, create vendor account
      if (status === 'payment') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: vendorError } = await supabase
            .from('approved_vendors')
            .insert({
              user_id: application.user_id,
              application_id: applicationId,
              store_name: application.store_name,
              product_category: application.product_category
            });

          if (vendorError) throw vendorError;
        }
      }

      await fetchApplications();
      toast({
        title: "Success",
        description: `Application status updated to ${status}`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchUserApplication();
  }, [user]);

  return {
    applications,
    userApplication,
    loading,
    submitApplication,
    updateApplicationStatus,
    refreshApplications: fetchApplications,
    refreshUserApplication: fetchUserApplication
  };
};