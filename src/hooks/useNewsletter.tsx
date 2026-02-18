
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscribe = async (email: string) => {
    setLoading(true);
    try {
      // First insert into database
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
          return { success: false, error: 'Already subscribed' };
        }
        throw error;
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-newsletter-email', {
          body: { email }
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't fail the subscription if email fails
      }

      toast({
        title: "Success!",
        description: "You've been successfully subscribed to our newsletter.",
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
};
