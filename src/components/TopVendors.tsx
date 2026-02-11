import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Vendor {
  id: string;
  store_name: string;
  store_logo?: string;
  subscription_plan?: string;
  created_at: string;
  user_id: string;
  followers_count?: number;
  rating?: number;
  products_count?: number;
  avatar_url?: string;
}

export const TopVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // Reduced limit to 3 to match the UI requirements and minimize network load
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('approved_vendors')
          .select('*')
          .eq('is_active', true)
          .eq('is_suspended', false)
          .order('created_at', { ascending: false })
          .limit(3);

        if (vendorsError) throw vendorsError;
        if (!vendorsData) return;

        const userIds = vendorsData.map(v => v.user_id);
        const vendorIds = vendorsData.map(v => v.id);

        // Batch fetch all required related data to solve N+1 problem
        const [profilesRes, productsRes, followersCounts] = await Promise.all([
          // Batch fetch profiles
          supabase.from('profiles').select('id, avatar_url').in('id', userIds),
          // Batch fetch products for count and rating calculation
          supabase.from('products').select('id, vendor_id').in('vendor_id', vendorIds),
          // Parallel follower counts (N=3 instead of 6)
          Promise.all(userIds.map(uid =>
            supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', uid)
          ))
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (productsRes.error) throw productsRes.error;

        // Batch fetch product ratings for all retrieved products
        const productIds = productsRes.data?.map(p => p.id) || [];
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('product_ratings')
          .select('stars, product_id')
          .in('product_id', productIds);

        if (ratingsError) throw ratingsError;

        // Create lookups for efficient mapping
        const profileMap = new Map(profilesRes.data?.map(p => [p.id, p.avatar_url]));
        const followerMap = new Map(userIds.map((uid, i) => [uid, followersCounts[i].count || 0]));

        const vendorProductsMap = new Map<string, string[]>();
        productsRes.data?.forEach(p => {
          if (!vendorProductsMap.has(p.vendor_id!)) vendorProductsMap.set(p.vendor_id!, []);
          vendorProductsMap.get(p.vendor_id!)?.push(p.id);
        });

        const productRatingsMap = new Map<string, number[]>();
        ratingsData?.forEach(r => {
          if (!productRatingsMap.has(r.product_id)) productRatingsMap.set(r.product_id, []);
          productRatingsMap.get(r.product_id)?.push(r.stars);
        });

        // Combine all data into the final vendor objects
        const vendorsWithStats = vendorsData.map(vendor => {
          const vendorProductIds = vendorProductsMap.get(vendor.id) || [];
          const allRatings: number[] = [];

          vendorProductIds.forEach(pid => {
            const productRatings = productRatingsMap.get(pid) || [];
            allRatings.push(...productRatings);
          });

          const avgRating = allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
            : 0;

          return {
            ...vendor,
            products_count: vendorProductIds.length,
            followers_count: followerMap.get(vendor.user_id) || 0,
            rating: avgRating,
            avatar_url: profileMap.get(vendor.user_id) || null,
          };
        });

        setVendors(vendorsWithStats);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'first_class':
        return { label: 'Premium Vendor', variant: 'default' as const };
      case 'economy':
        return { label: 'Verified Vendor', variant: 'secondary' as const };
      default:
        return { label: 'Verified Seller', variant: 'outline' as const };
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (vendors.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Top Rated Vendors
          </h2>
          <Link 
            to="/pilots" 
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See All Vendors
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.slice(0, 3).map((vendor) => {
            const planBadge = getPlanBadge(vendor.subscription_plan);

            return (
              <div
                key={vendor.id}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      <span className="text-xl font-bold text-muted-foreground">
                        {vendor.store_name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {vendor.store_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        {planBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(vendor.followers_count || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Followers
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                      {vendor.rating && vendor.rating > 0 ? (
                        <>
                          {vendor.rating.toFixed(1)}
                          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        </>
                      ) : (
                        'New'
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Rating
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">
                      {vendor.products_count}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Items
                    </p>
                  </div>
                </div>

                {/* Action */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-5 rounded-xl"
                >
                  <Link to={`/vendor/${vendor.user_id}`}>
                    Visit Store
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
