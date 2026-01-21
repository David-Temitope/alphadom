import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProductRating {
  id: string;
  product_id: string;
  user_id: string;
  stars: number;
  created_at: string;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: number[]; // [1-star %, 2-star %, 3-star %, 4-star %, 5-star %]
  userRating: number | null;
}

export const useProductRatings = (productId: string) => {
  const [stats, setStats] = useState<RatingStats>({
    averageRating: 0,
    totalRatings: 0,
    distribution: [0, 0, 0, 0, 0],
    userRating: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRatings = async () => {
    try {
      // Fetch all ratings for this product
      const { data: ratings, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;

      const total = ratings?.length || 0;
      
      if (total === 0) {
        setStats({
          averageRating: 0,
          totalRatings: 0,
          distribution: [0, 0, 0, 0, 0],
          userRating: null,
        });
        return;
      }

      // Calculate average
      const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
      const avg = sum / total;

      // Calculate distribution
      const dist = [0, 0, 0, 0, 0];
      ratings.forEach(r => {
        dist[r.stars - 1]++;
      });
      const distPercent = dist.map(count => Math.round((count / total) * 100));

      // Get user's rating
      const userRating = user 
        ? ratings.find(r => r.user_id === user.id)?.stars || null
        : null;

      setStats({
        averageRating: Math.round(avg * 2) / 2, // Round to nearest 0.5
        totalRatings: total,
        distribution: distPercent,
        userRating,
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const rateProduct = async (stars: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to rate this product.",
        variant: "destructive",
      });
      return false;
    }

    if (stars < 1 || stars > 5) {
      toast({
        title: "Invalid Rating",
        description: "Rating must be between 1 and 5 stars.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Upsert the rating
      const { error } = await supabase
        .from('product_ratings')
        .upsert({
          product_id: productId,
          user_id: user.id,
          stars,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'product_id,user_id',
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: `You rated this product ${stars} star${stars > 1 ? 's' : ''}.`,
      });

      await fetchRatings();
      return true;
    } catch (error) {
      console.error('Error rating product:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeRating = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('product_ratings')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Rating Removed",
        description: "Your rating has been removed.",
      });

      await fetchRatings();
      return true;
    } catch (error) {
      console.error('Error removing rating:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [productId, user?.id]);

  return {
    stats,
    loading,
    rateProduct,
    removeRating,
    refreshRatings: fetchRatings,
  };
};
