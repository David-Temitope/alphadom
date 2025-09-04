import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DeliveryRequest {
  id: string;
  order_id: string;
  vendor_id: string;
  dispatcher_id?: string;
  product_details: any;
  pickup_address: any;
  delivery_address: any;
  shipping_fee: number;
  status: string;
  requested_at: string;
  accepted_at?: string;
  delivered_at?: string;
  dispatcher_notes?: string;
  vendor_notes?: string;
}

export const useDeliveryRequests = () => {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDeliveryRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setDeliveryRequests(data || []);
    } catch (error) {
      console.error('Error fetching delivery requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeliveryRequest = async (orderDetails: {
    order_id: string;
    vendor_id: string;
    product_details: any;
    pickup_address: any;
    delivery_address: any;
    shipping_fee: number;
    vendor_notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert({
          ...orderDetails,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDeliveryRequests();
      toast({
        title: "Success",
        description: "Delivery request created successfully",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating delivery request:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery request",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
  };

  const assignDispatcher = async (deliveryRequestId: string, dispatcherId: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          dispatcher_id: dispatcherId,
          status: 'assigned'
        })
        .eq('id', deliveryRequestId);

      if (error) throw error;

      await fetchDeliveryRequests();
      toast({
        title: "Success",
        description: "Dispatcher assigned successfully",
      });
    } catch (error) {
      console.error('Error assigning dispatcher:', error);
      toast({
        title: "Error",
        description: "Failed to assign dispatcher",
        variant: "destructive",
      });
    }
  };

  const acceptDelivery = async (deliveryRequestId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          dispatcher_notes: notes
        })
        .eq('id', deliveryRequestId);

      if (error) throw error;

      // Update order status to shipped
      const { data: deliveryRequest } = await supabase
        .from('delivery_requests')
        .select('order_id')
        .eq('id', deliveryRequestId)
        .single();

      if (deliveryRequest) {
        await supabase
          .from('orders')
          .update({ status: 'shipped' })
          .eq('id', deliveryRequest.order_id);
      }

      await fetchDeliveryRequests();
      toast({
        title: "Success",
        description: "Delivery accepted and order marked as shipped",
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast({
        title: "Error",
        description: "Failed to accept delivery",
        variant: "destructive",
      });
    }
  };

  const completeDelivery = async (deliveryRequestId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          dispatcher_notes: notes
        })
        .eq('id', deliveryRequestId);

      if (error) throw error;

      // Update order status to delivered
      const { data: deliveryRequest } = await supabase
        .from('delivery_requests')
        .select('order_id')
        .eq('id', deliveryRequestId)
        .single();

      if (deliveryRequest) {
        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', deliveryRequest.order_id);
      }

      await fetchDeliveryRequests();
      toast({
        title: "Success",
        description: "Delivery completed successfully",
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDeliveryRequests();
  }, []);

  return {
    deliveryRequests,
    loading,
    createDeliveryRequest,
    assignDispatcher,
    acceptDelivery,
    completeDelivery,
    refreshDeliveryRequests: fetchDeliveryRequests
  };
};