import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBanStatus = () => {
  const { user } = useAuth();
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkBanStatus();
    } else {
      setIsBanned(false);
      setLoading(false);
    }
  }, [user]);

  const checkBanStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsBanned(data?.is_banned || false);
    } catch (error) {
      console.error('Error checking ban status:', error);
      setIsBanned(false);
    } finally {
      setLoading(false);
    }
  };

  return { isBanned, loading, refetch: checkBanStatus };
};
