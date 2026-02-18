import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Users, MapPin, CheckCircle, UserPlus, UserMinus, Share2, ShoppingBag, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserFollows } from '@/hooks/useUserFollows';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardMobile } from '@/components/ProductCardMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { VendorProfileSkeleton } from '@/components/skeletons/PageSkeletons';

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
  contact_phone?: string;
  is_registered?: boolean;
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

      // Fetch business address, phone, and is_registered from shop_applications
      let businessAddress = '';
      let contactPhone = '';
      let isRegistered = false;
      if (vendorData.application_id) {
        const { data: appData } = await supabase
          .from('shop_applications')
          .select('business_address, contact_phone, is_registered')
          .eq('id', vendorData.application_id)
          .maybeSingle();
        
        businessAddress = appData?.business_address || '';
        contactPhone = appData?.contact_phone || '';
        isRegistered = appData?.is_registered || false;
      }

      setVendor({
        ...vendorData,
        profile: profileData as any,
        business_address: businessAddress,
        contact_phone: contactPhone,
        is_registered: isRegistered
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${vendor?.store_name} on Alphadom!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.store_name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Store link copied to clipboard.",
      });
    }
  };

  if (loading) {
    return <VendorProfileSkeleton />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">Vendor not found</p>
        </div>
      </div>
    );
  }

  const customerCount = getCustomerCount(vendor.user_id);
  const isUserFollowing = isFollowing(vendor.user_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          {/* Mobile Layout */}
          <div className="flex md:hidden gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {vendor.profile?.avatar_url ? (
                    <img 
                      src={vendor.profile.avatar_url}
                      alt={vendor.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {vendor.store_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {vendor.is_registered && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-bold text-xl truncate">{vendor.store_name}</h1>
                {vendor.is_registered && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                by {vendor.profile?.full_name || 'Vendor'}
              </p>
              {vendor.business_address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{vendor.business_address}</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-muted-foreground">({vendor.total_orders} orders)</span>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons - Compact */}
          <div className="flex md:hidden gap-2 mt-4">
            {user && user.id !== vendor.user_id ? (
              <>
                <Button
                  onClick={handleFollow}
                  variant={isUserFollowing ? "outline" : "default"}
                  className="flex-1 rounded-xl"
                  size="sm"
                >
                  {isUserFollowing ? (
                    <><UserMinus className="w-4 h-4 mr-1" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
                  )}
                </Button>
                {vendor.contact_phone && (
                  <WhatsAppButton
                    phoneNumber={vendor.contact_phone}
                    variant="vendor"
                    className="rounded-xl"
                    iconOnly
                  />
                )}
              </>
            ) : !user ? (
              <Button
                asChild
                variant="default"
                className="flex-1 rounded-xl"
                size="sm"
              >
                <Link to="/auth">
                  <UserPlus className="w-4 h-4 mr-1" /> Follow
                </Link>
              </Button>
            ) : null}
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="rounded-xl h-9 w-9"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {vendor.profile?.avatar_url ? (
                    <img 
                      src={vendor.profile.avatar_url}
                      alt={vendor.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {vendor.store_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {vendor.is_registered && (
                  <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{vendor.store_name}</h1>
                  {vendor.is_registered && (
                    <Badge className="bg-primary/10 text-primary border-0">Verified Business</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{vendor.profile?.full_name}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="rounded-full">{vendor.product_category}</Badge>
                  {vendor.business_address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.business_address}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">({vendor.total_orders} reviews)</span>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="flex gap-3">
              {user && user.id !== vendor.user_id && (
                <>
                  <Button
                    onClick={handleFollow}
                    variant={isUserFollowing ? "outline" : "default"}
                    className="rounded-xl"
                  >
                    {isUserFollowing ? (
                      <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                    )}
                  </Button>
                  {vendor.contact_phone && (
                    <WhatsAppButton
                      phoneNumber={vendor.contact_phone}
                      variant="vendor"
                      className="rounded-xl"
                    />
                  )}
                </>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                className="rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
          <Card className="bg-card border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{customerCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Customers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{products.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Products</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                {new Date(vendor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Vendor Since</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card className="bg-card border-border/50 rounded-2xl shadow-sm">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="w-5 h-5 text-primary" />
                Products ({products.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  isMobile ? (
                    <ProductCardMobile key={product.id} product={product as any} />
                  ) : (
                    <ProductCard key={product.id} product={product as any} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No products yet</p>
                <p className="text-muted-foreground text-sm">Check back later for new arrivals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProfile;
