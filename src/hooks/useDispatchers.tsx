import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Dispatcher {
  id: string;
  user_id: string;
  dispatch_name: string;
  vehicle_type: string;
  phone_number: string;
  is_available: boolean;
  is_active: boolean;
  total_deliveries: number;
  success_rate: number;
  rating: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export const useDispatchers = () => {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [currentDispatcher, setCurrentDispatcher] = useState<Dispatcher | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDispatchers = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_dispatchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispatchers(data || []);
    } catch (error) {
      console.error('Error fetching dispatchers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dispatchers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDispatcher = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('approved_dispatchers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentDispatcher(data || null);
    } catch (error) {
      console.error('Error fetching current dispatcher:', error);
    }
  };

  const toggleAvailability = async (dispatcherId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('approved_dispatchers')
        .update({ is_available: isAvailable })
        .eq('id', dispatcherId);

      if (error) throw error;

      await fetchDispatchers();
      await fetchCurrentDispatcher();
      toast({
        title: "Success",
        description: `Availability ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const getAvailableDispatchers = () => {
    return dispatchers.filter(d => d.is_available && d.is_active);
  };

  useEffect(() => {
    fetchDispatchers();
    fetchCurrentDispatcher();
  }, [user]);

  return {
    dispatchers,
    currentDispatcher,
    loading,
    toggleAvailability,
    getAvailableDispatchers,
    refreshDispatchers: fetchDispatchers,
    isDispatcher: !!currentDispatcher
  };
};