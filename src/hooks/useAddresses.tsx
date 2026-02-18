import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressInput = Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAddresses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: AddressInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAddresses();
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAddress = async (id: string, address: Partial<AddressInput>) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({ ...address, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await fetchAddresses();
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAddresses(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      await fetchAddresses();
      toast({
        title: "Success",
        description: "Default address updated",
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive",
      });
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(a => a.is_default) || addresses[0] || null;
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    refreshAddresses: fetchAddresses,
  };
};
