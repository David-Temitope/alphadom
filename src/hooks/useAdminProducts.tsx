
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change received!', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(p => p.category) || [])];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return { product: data, error: null };
    } catch (err) {
      return { product: null, error: err };
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      console.log('Starting product deletion process for:', productId);
      
      // First get the product to check if it has an image
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image')
        .eq('id', productId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching product for deletion:', fetchError);
        throw fetchError;
      }

      console.log('Product data before deletion:', product);

      // Delete the product from database first
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        console.error('Error deleting product from database:', deleteError);
        throw deleteError;
      }

      console.log('Product deleted successfully from database');

      // If product had an image, try to delete it from storage
      if (product?.image && !product.image.includes('placeholder.svg')) {
        try {
          // Extract filename from URL - handle both full URLs and just filenames
          let imagePath = product.image;
          if (imagePath.includes('/')) {
            imagePath = imagePath.split('/').pop() || '';
          }
          
          if (imagePath && imagePath.trim() !== '') {
            console.log('Attempting to delete image from storage:', imagePath);
            const { error: storageError } = await supabase.storage
              .from('product-images')
              .remove([imagePath]);
            
            if (storageError) {
              console.warn('Failed to delete image from storage:', storageError);
              // Don't throw here, storage deletion is not critical
            } else {
              console.log('Image deleted from storage successfully');
            }
          }
        } catch (storageError) {
          console.warn('Storage deletion error (non-critical):', storageError);
          // Don't fail the whole operation if image deletion fails
        }
      }

      // Refresh the products list to reflect changes
      await fetchProducts();
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Critical error in deleteProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      return { success: false, error: errorMessage };
    }
  };

  return { 
    products, 
    loading, 
    error, 
    categories,
    createProduct, 
    updateProduct, 
    deleteProduct, 
    refetch: fetchProducts 
  };
};
