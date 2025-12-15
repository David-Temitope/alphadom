import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Users, MapPin, CheckCircle, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserFollows } from '@/hooks/useUserFollows';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardMobile } from '@/components/ProductCardMobile';
import { useIsMobile } from '@/hooks/use-mobile';

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
  application_id: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  business_address?: string;
}

interface VendorProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  reviews: number;
  stock_count?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  original_price?: number;
}

export const VendorProfile = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, getCustomerCount, toggleFollow } = useUserFollows();
  const isMobile = useIsMobile();

  const fetchVendorProfile = async () => {
    try {
      // Fetch vendor data using user_id
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

      // Fetch vendor's profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', vendorId)
        .single();

      // Fetch business address from shop_applications
      let businessAddress = '';
      if (vendorData.application_id) {
        const { data: appData } = await supabase
          .from('shop_applications')
          .select('business_address')
          .eq('id', vendorData.application_id)
          .maybeSingle();
        
        businessAddress = appData?.business_address || '';
      }

      setVendor({
        ...vendorData,
        profile: profileData as any,
        business_address: businessAddress
      });

      // Fetch vendor's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Vendor Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="relative">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  {vendor.profile?.avatar_url ? (
                    <img 
                      src={vendor.profile.avatar_url} 
                      alt={vendor.store_name}
                      className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl md:text-2xl font-semibold text-gray-600">
                      {vendor.store_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 md:p-1">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 md:gap-3">
                  <CardTitle className="text-lg md:text-3xl">{vendor.store_name}</CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] md:text-xs">
                    Verified
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-gray-600">{vendor.profile?.full_name}</p>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                  <span>{vendor.product_category}</span>
                  {vendor.business_address && (
                    <>
                      <span className="hidden md:inline">•</span>
                      <div className="hidden md:flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.business_address}</span>
                      </div>
                    </>
                  )}
                </div>
                {vendor.business_address && (
                  <div className="flex md:hidden items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{vendor.business_address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                  <span className="text-xs md:text-sm font-medium">4.8</span>
                  <span className="text-xs md:text-sm text-gray-500">({vendor.total_orders} reviews)</span>
                </div>
              </div>
            </div>

            {user && user.id !== vendor.user_id && (
              isMobile ? (
                <Button
                  onClick={handleFollow}
                  variant={isUserFollowing ? "outline" : "default"}
                  size="icon"
                  className="h-9 w-9"
                >
                  {isUserFollowing ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  variant={isUserFollowing ? "outline" : "default"}
                  className="flex items-center gap-2"
                >
                  {isUserFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards - 3 on mobile (no total sales), 4 on desktop */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">{customerCount}</div>
            <div className="text-[10px] md:text-sm text-gray-600">Customers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">{products.length}</div>
            <div className="text-[10px] md:text-sm text-gray-600">Products</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">{vendor.total_orders}</div>
            <div className="text-[10px] md:text-sm text-gray-600">Reviews</div>
          </CardContent>
        </Card>
        
        <Card className="hidden md:block">
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">
              ₦{vendor.total_revenue.toLocaleString()}
            </div>
            <div className="text-[10px] md:text-sm text-gray-600">Total Sales</div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map(product => (
                isMobile ? (
                  <ProductCardMobile key={product.id} product={product as any} />
                ) : (
                  <ProductCard key={product.id} product={product as any} />
                )
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