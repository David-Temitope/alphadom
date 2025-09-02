import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserType {
  id: string;
  user_id: string;
  user_type: 'regular' | 'vendor' | 'dispatch';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserTypes = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserTypes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_types')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setUserTypes((data as UserType[]) || []);
    } catch (error) {
      console.error('Error fetching user types:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUserType = async (userType: 'regular' | 'vendor' | 'dispatch') => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('user_types')
        .insert({
          user_id: user.id,
          user_type: userType
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUserTypes();
      toast({
        title: "Success",
        description: `User type ${userType} added successfully!`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding user type:', error);
      toast({
        title: "Error",
        description: "Failed to add user type",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  const hasUserType = (type: 'regular' | 'vendor' | 'dispatch') => {
    return userTypes.some(ut => ut.user_type === type && ut.is_active);
  };

  useEffect(() => {
    fetchUserTypes();
  }, [user]);

  return {
    userTypes,
    loading,
    addUserType,
    hasUserType,
    refreshUserTypes: fetchUserTypes
  };
};