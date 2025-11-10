import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Users, MapPin, CheckCircle, UserPlus, UserMinus, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserFollows } from '@/hooks/useUserFollows';
import { ProductCard } from '@/components/ProductCard';

interface VendorProfile {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  is_active: boolean;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

interface VendorProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  reviews: number;
}

export const VendorProfile = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, getCustomerCount, toggleFollow } = useUserFollows();

  const fetchVendorProfile = async () => {
    try {
      // Fetch vendor data using user_id since vendorId is the user_id from params
      const { data: vendorData, error: vendorError } = await supabase
        .from('approved_vendors')
        .select('*')
        .eq('user_id', vendorId)
        .maybeSingle();

      if (vendorError) throw vendorError;
      
      if (!vendorData) {
        setVendor(null);
        return;
      }

      // Fetch profile data separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', vendorId)
        .maybeSingle();

      if (profileError) throw profileError;

      setVendor({
        ...vendorData,
        profile: profileData as any
      });

      // Fetch vendor's products using vendor's ID from the database
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData?.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorProfile();
    }
  }, [vendorId]);

  const handleFollow = () => {
    if (vendor) {
      toggleFollow(vendor.user_id);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/vendor/${vendorId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.store_name,
          text: `Check out ${vendor?.store_name} on Alphadom!`,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor not found</p>
      </div>
    );
  }

  const customerCount = getCustomerCount(vendor.user_id);
  const isUserFollowing = isFollowing(vendor.user_id);

  const vendorDuration = () => {
    const created = new Date(vendor.created_at);
    const now = new Date();
    const months = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 1) return "New Vendor";
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Vendor Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  {vendor.profile?.avatar_url ? (
                    <img 
                      src={vendor.profile.avatar_url} 
                      alt={vendor.store_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-semibold text-gray-600">
                      {vendor.store_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <CardTitle className="text-2xl sm:text-3xl break-words">{vendor.store_name}</CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800 w-fit">
                    Verified
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">{vendor.profile?.full_name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span>Category: {vendor.product_category}</span>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Lagos, Nigeria</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-xs sm:text-sm font-medium">4.8</span>
                  <span className="text-xs sm:text-sm text-gray-500">(Customer rating)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {user && user.id !== vendor.user_id && (
                <Button
                  onClick={handleFollow}
                  variant={isUserFollowing ? "outline" : "default"}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {isUserFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">{customerCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Customers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">{products.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Products</div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary">{vendorDuration()}</div>
            <div className="text-xs sm:text-sm text-gray-600">Vendor Since</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products ({products.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;