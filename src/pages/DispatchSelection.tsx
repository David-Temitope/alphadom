import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Phone, Truck, ArrowLeft } from 'lucide-react';
import { useDispatchers } from '@/hooks/useDispatchers';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const DispatchSelection = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getAvailableDispatchers } = useDispatchers();
  const { assignDispatcher } = useDeliveryRequests();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assigning, setAssigning] = useState<string | null>(null);

  const availableDispatchers = getAvailableDispatchers();

  const handleSelectDispatcher = async (dispatcherId: string) => {
    if (!orderId || !user) return;

    setAssigning(dispatcherId);
    try {
      // For now, we'll create a mock delivery request
      // In a real app, this would be based on the actual order data
      await assignDispatcher(orderId, dispatcherId);
      
      toast({
        title: "Success",
        description: "Dispatcher assigned successfully",
      });
      
      navigate(-1); // Go back to previous page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign dispatcher",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Select Dispatcher</h1>
        <p className="text-muted-foreground">Choose an available dispatcher for this order</p>
      </div>

      {availableDispatchers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Available Dispatchers</h3>
            <p className="text-muted-foreground">
              There are currently no dispatchers available for delivery. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {availableDispatchers.map((dispatcher) => (
            <Card key={dispatcher.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="" alt={dispatcher.dispatch_name} />
                      <AvatarFallback className="text-lg">
                        {dispatcher.dispatch_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <CardTitle className="text-xl">{dispatcher.dispatch_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{dispatcher.vehicle_type}</Badge>
                        <Badge variant={dispatcher.is_available ? "default" : "secondary"}>
                          {dispatcher.is_available ? "Available" : "Busy"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{dispatcher.rating.toFixed(1)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          <span>{dispatcher.total_deliveries} deliveries</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span>{dispatcher.success_rate.toFixed(0)}% success rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectDispatcher(dispatcher.id)}
                    disabled={assigning === dispatcher.id || !dispatcher.is_available}
                    className="min-w-[120px]"
                  >
                    {assigning === dispatcher.id ? "Assigning..." : "Select"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{dispatcher.phone_number}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Total Earnings: ${dispatcher.total_earnings.toLocaleString()}</div>
                      <div>Active since: {new Date(dispatcher.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DispatchSelection;