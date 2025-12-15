import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Store, Truck, Star, Package, UserPlus, UserMinus, Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserFollows } from '@/hooks/useUserFollows';
import { Link } from 'react-router-dom';

interface Pilot {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_types: string[];
  vendor_info?: {
    store_name: string;
    product_category: string;
    total_products: number;
    rating: number;
  };
  dispatcher_info?: {
    dispatch_name: string;
    vehicle_type: string;
    total_deliveries: number;
    rating: number;
  };
  likes_count: number;
  is_liked_by_current_user: boolean;
  customer_count?: number;
}

export const Pilots = () => {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFollowing, getCustomerCount, toggleFollow } = useUserFollows();

  const fetchPilots = async () => {
    try {
      // Fetch all users with their types and info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch user types
      const { data: userTypes, error: typesError } = await supabase
        .from('user_types')
        .select('user_id, user_type')
        .eq('is_active', true);

      if (typesError) throw typesError;

      // Fetch vendor info
      const { data: vendors, error: vendorsError } = await supabase
        .from('approved_vendors')
        .select('user_id, store_name, product_category, total_products');

      if (vendorsError) throw vendorsError;

      // Fetch dispatcher info
      const { data: dispatchers, error: dispatchersError } = await supabase
        .from('approved_dispatchers')
        .select('user_id, dispatch_name, vehicle_type, total_deliveries, rating');

      if (dispatchersError) throw dispatchersError;

      // Fetch user likes
      const { data: likes, error: likesError } = await supabase
        .from('user_likes')
        .select('liked_user_id, liker_id');

      if (likesError) throw likesError;

      // Combine data
      const pilotsData = profiles?.map(profile => {
        const userTypeData = userTypes?.filter(ut => ut.user_id === profile.id) || [];
        const types = userTypeData.map(ut => ut.user_type);
        
        const vendorInfo = vendors?.find(v => v.user_id === profile.id);
        const dispatcherInfo = dispatchers?.find(d => d.user_id === profile.id);
        
        const userLikes = likes?.filter(l => l.liked_user_id === profile.id) || [];
        const isLikedByCurrentUser = user ? userLikes.some(l => l.liker_id === user.id) : false;
        const customerCount = getCustomerCount(profile.id);

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.email,
          avatar_url: profile.avatar_url,
          user_types: types,
          vendor_info: vendorInfo ? {
            store_name: vendorInfo.store_name,
            product_category: vendorInfo.product_category,
            total_products: vendorInfo.total_products,
            rating: 4.5 // Mock rating for now
          } : undefined,
          dispatcher_info: dispatcherInfo ? {
            dispatch_name: dispatcherInfo.dispatch_name,
            vehicle_type: dispatcherInfo.vehicle_type,
            total_deliveries: dispatcherInfo.total_deliveries,
            rating: dispatcherInfo.rating
          } : undefined,
          likes_count: userLikes.length,
          is_liked_by_current_user: isLikedByCurrentUser,
          customer_count: customerCount
        };
      }) || [];

      // Filter out regular users without vendor or dispatcher info
      const filteredPilots = pilotsData.filter(pilot => 
        pilot.user_types.includes('vendor') || pilot.user_types.includes('dispatch')
      );

      setPilots(filteredPilots);
    } catch (error) {
      console.error('Error fetching pilots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pilots data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (pilotId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like pilots",
        variant: "destructive",
      });
      return;
    }

    try {
      const pilot = pilots.find(p => p.id === pilotId);
      if (!pilot) return;

      if (pilot.is_liked_by_current_user) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('liker_id', user.id)
          .eq('liked_user_id', pilotId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('user_likes')
          .insert({
            liker_id: user.id,
            liked_user_id: pilotId
          });

        if (error) throw error;
      }

      // Refresh pilots data
      await fetchPilots();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleFollow = (pilotId: string) => {
    toggleFollow(pilotId);
  };

  const getTopCategory = (vendorInfo: any) => {
    return vendorInfo?.product_category || 'General';
  };

  useEffect(() => {
    fetchPilots();
  }, [user]);

  // Filter pilots based on search term
  const filteredPilots = pilots.filter(pilot => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pilot.full_name?.toLowerCase().includes(searchLower) ||
      pilot.vendor_info?.store_name?.toLowerCase().includes(searchLower) ||
      pilot.vendor_info?.product_category?.toLowerCase().includes(searchLower) ||
      pilot.dispatcher_info?.dispatch_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pilots Directory</h1>
        <p className="text-muted-foreground mb-6">Discover vendors and dispatchers in our marketplace</p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, store, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPilots.map(pilot => (
          <Card key={pilot.id} className="relative hover:shadow-lg transition-shadow cursor-pointer">
            <Link to={pilot.user_types.includes('vendor') ? `/vendor/${pilot.id}` : `/dispatcher/${pilot.id}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center">
                    {pilot.avatar_url ? (
                      <img 
                        src={pilot.avatar_url} 
                        alt={pilot.full_name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold text-2xl text-muted-foreground">
                        {pilot.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-base md:text-lg">{pilot.full_name}</CardTitle>
                    <div className="flex gap-1 mt-1 justify-center">
                      {pilot.user_types.includes('vendor') && pilot.vendor_info && (
                        <Badge variant="default" className="text-xs">
                          {pilot.vendor_info.product_category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Customer Count and Rating */}
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">{pilot.customer_count || 0} Customers</span>
                  {(pilot.vendor_info || pilot.dispatcher_info) && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{pilot.vendor_info?.rating || pilot.dispatcher_info?.rating || 0}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {filteredPilots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? `No pilots found matching "${searchTerm}"` : 'No pilots found. Be the first to join!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Pilots;