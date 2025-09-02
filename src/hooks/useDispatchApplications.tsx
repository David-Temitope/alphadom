import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DispatchApplication {
  id: string;
  user_id: string;
  dispatch_name: string;
  vehicle_type: string;
  phone_number: string;
  availability: string;
  experience_years?: number;
  coverage_areas?: string[];
  license_number?: string;
  email: string;
  emergency_contact?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  payment_due_date?: string;
  payment_received_at?: string;
  payment_countdown_expires_at?: string;
}

export const useDispatchApplications = () => {
  const [applications, setApplications] = useState<DispatchApplication[]>([]);
  const [userApplication, setUserApplication] = useState<DispatchApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('dispatch_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching dispatch applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dispatch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dispatch_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserApplication(data || null);
    } catch (error) {
      console.error('Error fetching user dispatch application:', error);
    }
  };

  const submitApplication = async (applicationData: Omit<DispatchApplication, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('dispatch_applications')
        .insert({
          user_id: user.id,
          ...applicationData
        })
        .select()
        .single();

      if (error) throw error;

      setUserApplication(data);
      toast({
        title: "Success",
        description: "Dispatch application submitted successfully!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error submitting dispatch application:', error);
      toast({
        title: "Error",
        description: "Failed to submit dispatch application",
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
        updateData.payment_due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        updateData.payment_countdown_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      if (status === 'payment') {
        updateData.payment_received_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('dispatch_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // If approved and payment received, create dispatcher account
      if (status === 'payment') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: dispatcherError } = await supabase
            .from('approved_dispatchers')
            .insert({
              user_id: application.user_id,
              application_id: applicationId,
              dispatch_name: application.dispatch_name,
              vehicle_type: application.vehicle_type,
              phone_number: application.phone_number
            });

          if (dispatcherError) throw dispatcherError;
        }
      }

      await fetchApplications();
      toast({
        title: "Success",
        description: `Dispatch application status updated to ${status}`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating dispatch application:', error);
      toast({
        title: "Error",
        description: "Failed to update dispatch application status",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    setLoading(true);
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