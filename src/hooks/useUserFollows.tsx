import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useBanStatus } from '@/hooks/useBanStatus';

export const useUserFollows = () => {
  const [follows, setFollows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isBanned } = useBanStatus();

  const fetchFollows = async () => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*');

      if (error) throw error;
      setFollows(data || []);
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = (userId: string) => {
    if (!user) return false;
    return follows.some(follow => 
      follow.follower_id === user.id && follow.following_id === userId
    );
  };

  const getCustomerCount = (userId: string) => {
    return follows.filter(follow => follow.following_id === userId).length;
  };

  const toggleFollow = async (userId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to follow users",
        variant: "destructive",
      });
      return;
    }

    if (isBanned) {
      toast({
        title: "Account Restricted",
        description: "Your account has been suspended. You cannot follow vendors.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyFollowing = isFollowing(userId);
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
      }

      // Refresh follows data
      await fetchFollows();
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Couldn't Follow",
        description: "Unable to follow this vendor. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFollows();
  }, [user]);

  return {
    follows,
    loading,
    isFollowing,
    getCustomerCount,
    toggleFollow,
    refreshFollows: fetchFollows
  };
};