import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Truck, Clock, MapPin, Mail, Phone, Package, ArrowLeft } from 'lucide-react';

interface DispatcherData {
  id: string;
  user_id: string;
  dispatch_name: string;
  vehicle_type: string;
  phone_number: string;
  email: string;
  availability: string;
  coverage_areas: string[];
  experience_years: number;
  rating: number;
  total_deliveries: number;
  success_rate: number;
}

export const DispatchProfile = () => {
  const { dispatchId } = useParams();
  const [dispatcher, setDispatcher] = useState<DispatcherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDispatcherProfile();
  }, [dispatchId]);

  const fetchDispatcherProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_dispatchers')
        .select(`
          *,
          profiles!approved_dispatchers_user_id_fkey(email),
          dispatch_applications!dispatch_applications_user_id_fkey(
            availability,
            coverage_areas,
            experience_years
          )
        `)
        .eq('user_id', dispatchId)
        .single();

      if (error) throw error;

      const dispatcherProfile = {
        id: data.id,
        user_id: data.user_id,
        dispatch_name: data.dispatch_name,
        vehicle_type: data.vehicle_type,
        phone_number: data.phone_number,
        email: (data as any).profiles?.email || '',
        availability: (data as any).dispatch_applications?.availability || '',
        coverage_areas: (data as any).dispatch_applications?.coverage_areas || [],
        experience_years: (data as any).dispatch_applications?.experience_years || 0,
        rating: data.rating,
        total_deliveries: data.total_deliveries,
        success_rate: data.success_rate,
      };

      setDispatcher(dispatcherProfile);
    } catch (error) {
      console.error('Error fetching dispatcher profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!dispatcher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Dispatcher not found</p>
            <Link to="/pilots">
              <Button className="mt-4">Back to Pilots</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/pilots">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pilots
        </Button>
      </Link>

      {/* Dispatcher Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl bg-purple-100">
                <Truck className="w-12 h-12 text-purple-600" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{dispatcher.dispatch_name}</h1>
                  <Badge variant="secondary" className="mb-2">
                    <Truck className="w-3 h-3 mr-1" />
                    {dispatcher.vehicle_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold">{dispatcher.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {dispatcher.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {dispatcher.email}
                  </div>
                )}
                {dispatcher.phone_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {dispatcher.phone_number}
                  </div>
                )}
                {dispatcher.availability && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {dispatcher.availability}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  {dispatcher.experience_years} years experience
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{dispatcher.total_deliveries}</div>
              <p className="text-sm text-muted-foreground">Total Deliveries</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dispatcher.success_rate.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dispatcher.rating.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Coverage Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dispatcher.coverage_areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dispatcher.coverage_areas.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No coverage areas specified</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchProfile;
