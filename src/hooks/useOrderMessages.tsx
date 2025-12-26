import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { useDispatchers } from '@/hooks/useDispatchers';

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_type: 'customer' | 'vendor' | 'dispatcher';
  message: string;
  is_read: boolean;
  created_at: string;
}

export const useOrderMessages = (orderId: string | null) => {
  const { user } = useAuth();
  const { currentVendor } = useVendors();
  const { currentDispatcher } = useDispatchers();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Determine sender type based on user role
  const getSenderType = useCallback((): 'customer' | 'vendor' | 'dispatcher' | null => {
    if (currentVendor) return 'vendor';
    if (currentDispatcher) return 'dispatcher';
    if (user) return 'customer';
    return null;
  }, [currentVendor, currentDispatcher, user]);

  const fetchMessages = useCallback(async () => {
    if (!orderId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as OrderMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!orderId || !user || !messageText.trim()) return false;

    const senderType = getSenderType();
    if (!senderType) return false;

    setSending(true);
    try {
      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          sender_type: senderType,
          message: messageText.trim(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setSending(false);
    }
  }, [orderId, user, getSenderType]);

  const markAsRead = useCallback(async () => {
    if (!orderId || !user) return;

    try {
      // Mark messages from other senders as read
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [orderId, user]);

  // Fetch messages on mount and set up realtime subscription
  useEffect(() => {
    if (!orderId) return;

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMessage = payload.new as OrderMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchMessages]);

  // Count unread messages
  const unreadCount = messages.filter(
    (m) => !m.is_read && m.sender_id !== user?.id
  ).length;

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
    unreadCount,
    senderType: getSenderType(),
  };
};
