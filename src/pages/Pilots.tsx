import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Store, Truck, Star, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
}

export const Pilots = () => {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
          is_liked_by_current_user: isLikedByCurrentUser
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

  const getTopCategory = (vendorInfo: any) => {
    return vendorInfo?.product_category || 'General';
  };

  useEffect(() => {
    fetchPilots();
  }, [user]);

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
        <p className="text-gray-600">Discover vendors and dispatchers in our marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pilots.map(pilot => (
          <Card key={pilot.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {pilot.avatar_url ? (
                      <img 
                        src={pilot.avatar_url} 
                        alt={pilot.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold text-gray-600">
                        {pilot.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pilot.full_name}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      {pilot.user_types.includes('vendor') && (
                        <Badge variant="default" className="text-xs">
                          <Store className="w-3 h-3 mr-1" />
                          Vendor
                        </Badge>
                      )}
                      {pilot.user_types.includes('dispatch') && (
                        <Badge variant="secondary" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Dispatcher
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(pilot.id)}
                  className={pilot.is_liked_by_current_user ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart 
                    className={`w-5 h-5 ${pilot.is_liked_by_current_user ? 'fill-current' : ''}`} 
                  />
                  <span className="ml-1 text-sm">{pilot.likes_count}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {pilot.vendor_info && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{pilot.vendor_info.store_name}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{pilot.vendor_info.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Category: {getTopCategory(pilot.vendor_info)}</span>
                      <div className="flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        {pilot.vendor_info.total_products} products
                      </div>
                    </div>
                  </div>
                )}

                {pilot.dispatcher_info && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{pilot.dispatcher_info.dispatch_name}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{pilot.dispatcher_info.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Vehicle: {pilot.dispatcher_info.vehicle_type}</span>
                      <span>{pilot.dispatcher_info.total_deliveries} deliveries</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pilots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No pilots found. Be the first to join!</p>
        </div>
      )}
    </div>
  );
};

export default Pilots;