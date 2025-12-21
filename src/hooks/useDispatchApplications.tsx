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
      // Silent fail - regular users don't need to see this error
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
        .maybeSingle();

      if (error) throw error;
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
        updateData.status = 'active'; // Set status to active instead of payment
      }

      const { data, error } = await supabase
        .from('dispatch_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // If payment received, create dispatcher account
      if (status === 'payment') {
        const application = applications.find(app => app.id === applicationId) || data;
        if (application) {
          console.log('Creating dispatcher account for:', application);
          
          // Check if dispatcher already exists to avoid duplicate insertion
          const { data: existingDispatcher } = await supabase
            .from('approved_dispatchers')
            .select('id')
            .eq('user_id', application.user_id)
            .single();

          if (!existingDispatcher) {
            const { data: dispatcherData, error: dispatcherError } = await supabase
              .from('approved_dispatchers')
              .insert({
                user_id: application.user_id,
                application_id: applicationId,
                dispatch_name: application.dispatch_name,
                vehicle_type: application.vehicle_type,
                phone_number: application.phone_number
              })
              .select()
              .single();

            if (dispatcherError) {
              console.error('Dispatcher creation error:', dispatcherError);
              throw dispatcherError;
            }

            console.log('Dispatcher account created:', dispatcherData);
          }

          // Check if user type already exists
          const { data: existingUserType } = await supabase
            .from('user_types')
            .select('id')
            .eq('user_id', application.user_id)
            .eq('user_type', 'dispatch')
            .eq('is_active', true)
            .single();

          if (!existingUserType) {
            const { error: userTypeError } = await supabase
              .from('user_types')
              .insert({
                user_id: application.user_id,
                user_type: 'dispatch'
              });

            if (userTypeError) {
              console.error('User type creation error:', userTypeError);
              throw userTypeError;
            }
          }
        }
      }

      await fetchApplications();
      toast({
        title: "Success",
        description: status === 'payment' ? 'Dispatch access granted successfully!' : `Dispatch application status updated to ${status}`,
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

  const deleteApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('dispatch_applications')
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
      console.error('Error deleting dispatch application:', error);
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