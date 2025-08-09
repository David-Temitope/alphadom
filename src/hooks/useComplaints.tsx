import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string; // Allow any string status from database
  admin_response?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive",
      });
    }
  };

  const fetchUserComplaints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserComplaints((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching user complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (subject: string, description: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          subject,
          description
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUserComplaints();
      toast({
        title: "Success",
        description: "Complaint submitted successfully!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string, adminResponse?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single();

      if (error) throw error;

      await fetchComplaints();
      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchUserComplaints();
  }, [user]);

  return {
    complaints,
    userComplaints,
    loading,
    submitComplaint,
    updateComplaintStatus,
    refreshComplaints: fetchComplaints,
    refreshUserComplaints: fetchUserComplaints
  };
};