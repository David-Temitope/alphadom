import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  likes: number;
  dislikes: number;
  user_reaction?: 'like' | 'dislike' | null;
}

export const useProductComments = (productId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('product_comments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch profiles and reactions for each comment
      const commentsWithData = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', comment.user_id)
            .single();

          // Fetch likes/dislikes
          const { data: likesData } = await supabase
            .from('comment_likes')
            .select('*')
            .eq('comment_id', comment.id);

          const likes = likesData?.filter(l => l.is_like).length || 0;
          const dislikes = likesData?.filter(l => !l.is_like).length || 0;
          
          // Get user's reaction if authenticated
          const { data: { user } } = await supabase.auth.getUser();
          const userReaction = user ? 
            likesData?.find(l => l.user_id === user.id) : null;

          return {
            id: comment.id,
            comment: comment.comment,
            created_at: comment.created_at,
            user_id: comment.user_id,
            profiles: profileData || undefined,
            likes,
            dislikes,
            user_reaction: userReaction ? (userReaction.is_like ? 'like' as const : 'dislike' as const) : null
          };
        })
      );

      setComments(commentsWithData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (comment: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add comments",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('product_comments')
        .insert({
          product_id: productId,
          user_id: user.id,
          comment
        });

      if (error) throw error;

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });

      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const toggleReaction = async (commentId: string, isLike: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to react to comments",
          variant: "destructive",
        });
        return;
      }

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // If same reaction, remove it
        if (existingReaction.is_like === isLike) {
          await supabase
            .from('comment_likes')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // If different reaction, update it
          await supabase
            .from('comment_likes')
            .update({ is_like: isLike })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            is_like: isLike
          });
      }

      fetchComments();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  return {
    comments,
    loading,
    addComment,
    toggleReaction,
    refreshComments: fetchComments
  };
};