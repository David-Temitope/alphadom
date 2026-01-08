import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  featured_image_url: string | null;
  additional_images: string[];
  author_name: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (publishedOnly = true) => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...post,
          published_at: post.published ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Blog post created successfully!');
      return data;
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post');
      throw error;
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const updateData = { ...updates };
      
      // Set published_at when publishing for the first time
      if (updates.published && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Blog post updated successfully!');
      return data;
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      toast.error('Failed to update blog post');
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Blog post deleted successfully!');
      setPosts(posts.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    uploadImage,
    refetch: () => fetchPosts()
  };
};
