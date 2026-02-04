import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface ShopApplication {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  price_range_min: number;
  price_range_max: number;
  email: string;
  bank_details: any;
  business_description?: string;
  contact_phone?: string;
  business_address?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  payment_due_date?: string;
  payment_received_at?: string;
  payment_countdown_expires_at?: string;
  // New fields for identity verification and business info
  id_type?: string;
  id_number?: string;
  id_image_url?: string;
  business_type?: string;
  is_registered?: boolean;
  tin_number?: string;
  agreed_policies?: any;
  subscription_plan?: string;
  vendor_bank_details?: any;
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
      logger.error('Error fetching applications:', error);
      // Only show error toast if user is likely an admin viewing all applications
      // Regular users don't need to see this error
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
      logger.error('Error fetching user application:', error);
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
      logger.error('Error submitting application:', error);
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
      logger.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  const deleteApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('shop_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      await fetchApplications();
      await fetchUserApplication();
      toast({
        title: "Success",
        description: "Application deleted successfully. You can now reapply.",
      });

      return { error: null };
    } catch (error: any) {
      logger.error('Error deleting shop application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchApplications();
    fetchUserApplication();
    setLoading(false);
  }, [user]);

  return {
    applications,
    userApplication,
    loading,
    submitApplication,
    updateApplicationStatus,
    deleteApplication,
    refreshApplications: fetchApplications,
    refreshUserApplication: fetchUserApplication
  };
};