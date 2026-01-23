import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Search, Store, Package, Users, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  product_category: string;
  store_logo?: string;
  cover_image?: string;
  subscription_plan?: string;
  is_active: boolean;
  products_count: number;
  followers_count: number;
  rating: number;
  business_address?: string;
  avatar_url?: string;
}

export const Pilots = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useAuth();

  const fetchVendors = async () => {
    try {
      // Fetch approved vendors with cover_image
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('approved_vendors')
        .select('id, user_id, store_name, product_category, subscription_plan, is_active, application_id, cover_image')
        .eq('is_active', true)
        .eq('is_suspended', false)
        .order('created_at', { ascending: false });

      if (vendorsError) throw vendorsError;

      // Get additional data for each vendor
      const vendorsWithStats = await Promise.all(
        (vendorsData || []).map(async (vendor) => {
          // Count products
          const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendor.id);

          // Count followers
          const { count: followersCount } = await supabase
            .from('user_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', vendor.user_id);

          // Get business address from application
          let businessAddress = '';
          if (vendor.application_id) {
            const { data: appData } = await supabase
              .from('shop_applications')
              .select('business_address')
              .eq('id', vendor.application_id)
              .single();
            businessAddress = appData?.business_address || '';
          }

          // Get avatar from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', vendor.user_id)
            .single();

          // Calculate average rating from product_ratings
          const { data: vendorProducts } = await supabase
            .from('products')
            .select('id')
            .eq('vendor_id', vendor.id);

          let avgRating = 0;
          if (vendorProducts && vendorProducts.length > 0) {
            const productIds = vendorProducts.map(p => p.id);
            const { data: ratings } = await supabase
              .from('product_ratings')
              .select('stars')
              .in('product_id', productIds);

            if (ratings && ratings.length > 0) {
              avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
            }
          }

          return {
            ...vendor,
            products_count: productsCount || 0,
            followers_count: followersCount || 0,
            rating: avgRating,
            business_address: businessAddress,
            avatar_url: profileData?.avatar_url || null,
            cover_image: vendor.cover_image || null,
          };
        })
      );

      setVendors(vendorsWithStats);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [user]);

  // Get unique categories
  const categories = ['all', ...new Set(vendors.map(v => v.product_category).filter(Boolean))];

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.product_category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.product_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'first_class':
        return { label: 'Premium', variant: 'default' as const, className: 'bg-amber-500' };
      case 'economy':
        return { label: 'Verified', variant: 'secondary' as const, className: 'bg-blue-500 text-white' };
      default:
        return { label: 'Seller', variant: 'outline' as const, className: '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              <Store className="w-3 h-3 mr-1" />
              Vendor Directory
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Discover Verified Vendors
            </h1>
            <p className="text-muted-foreground mb-6">
              Browse through our trusted network of sellers offering quality products across various categories.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full whitespace-nowrap"
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>{filteredVendors.length} vendors found</span>
            {selectedCategory !== 'all' && (
              <>
                <span>•</span>
                <span>Category: {selectedCategory}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              const planBadge = getPlanBadge(vendor.subscription_plan);
              
              return (
                <Card
                  key={vendor.id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                    <CardContent className="p-0">
                      {/* Header with gradient or cover image */}
                      <div className="h-24 relative overflow-hidden">
                        {vendor.cover_image ? (
                          <img 
                            src={vendor.cover_image} 
                            alt={`${vendor.store_name} cover`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}
                        <Badge 
                          className={`absolute top-3 right-3 ${planBadge.className}`}
                          variant={planBadge.variant}
                        >
                          {planBadge.label}
                        </Badge>
                      </div>
                    
                    {/* Store Logo */}
                    <div className="px-6 -mt-10 relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center overflow-hidden shadow-md">
                        {vendor.avatar_url ? (
                          <img
                            src={vendor.avatar_url}
                            alt={vendor.store_name}
                            className="w-full h-full object-cover"
                          />
                        ) : vendor.store_logo ? (
                          <img
                            src={vendor.store_logo}
                            alt={vendor.store_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {vendor.store_name?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-4 space-y-4">
                      {/* Store Name & Category */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {vendor.store_name}
                          </h3>
                          {(vendor.subscription_plan === 'first_class' || vendor.subscription_plan === 'economy') && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vendor.product_category}
                        </p>
                      </div>

                      {/* Location if available */}
                      {vendor.business_address && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{vendor.business_address}</span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/50">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                            {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
                            {vendor.rating > 0 && <Star className="w-3 h-3 fill-primary text-primary" />}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                        </div>
                        <div className="text-center border-x border-border/50">
                          <p className="text-lg font-bold text-foreground">
                            {vendor.products_count}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">Products</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">
                            {vendor.followers_count}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">Followers</p>
                        </div>
                      </div>

                      {/* Action */}
                      <Button asChild className="w-full rounded-xl group-hover:bg-primary" variant="outline">
                        <Link to={`/vendor/${vendor.user_id}`} className="flex items-center justify-center gap-2">
                          Visit Store
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredVendors.length === 0 && (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Vendors Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `No vendors match "${searchTerm}"`
                  : 'There are no vendors in this category yet.'}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Want to Sell on Alphadom?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join our growing community of vendors and reach thousands of customers.
          </p>
          <Button asChild size="lg">
            <Link to="/become-a-vendor">
              Become a Vendor
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pilots;
