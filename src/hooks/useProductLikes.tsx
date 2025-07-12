
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProductLikes = (productId?: string) => {
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLikes();
    } else {
      setLikedProducts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedProducts(data?.map(item => item.product_id) || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like products.",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedProducts.includes(productId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        setLikedProducts(prev => prev.filter(id => id !== productId));
      } else {
        const { error } = await supabase
          .from('product_likes')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;
        setLikedProducts(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    likedProducts,
    loading,
    toggleLike,
    isLiked: (productId: string) => likedProducts.includes(productId),
  };
};
