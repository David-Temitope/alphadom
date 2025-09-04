import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Truck, 
  DollarSign, 
  Star, 
  Package, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDispatchers } from '@/hooks/useDispatchers';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DispatchDashboard = () => {
  const { currentDispatcher, toggleAvailability } = useDispatchers();
  const { deliveryRequests, acceptDelivery, completeDelivery } = useDeliveryRequests();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const myDeliveryRequests = deliveryRequests.filter(
    request => request.dispatcher_id === currentDispatcher?.id
  );

  const pendingRequests = deliveryRequests.filter(
    request => !request.dispatcher_id && request.status === 'pending'
  );

  const handleAcceptDelivery = async (requestId: string) => {
    await acceptDelivery(requestId, notes);
    setNotes('');
    setSelectedRequest(null);
  };

  const handleCompleteDelivery = async (requestId: string) => {
    await completeDelivery(requestId, notes);
    setNotes('');
    setSelectedRequest(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to access your dispatch dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDispatcher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              You don't have dispatcher access. Please apply as a dispatcher first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dispatch Dashboard</h1>
              <p className="text-muted-foreground">{currentDispatcher.dispatch_name}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="availability">Available for deliveries</Label>
              <Switch
                id="availability"
                checked={currentDispatcher.is_available}
                onCheckedChange={() => toggleAvailability(currentDispatcher.id, !currentDispatcher.is_available)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active-deliveries">Active Deliveries</TabsTrigger>
            <TabsTrigger value="available-requests">Available Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${currentDispatcher.total_earnings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentDispatcher.total_deliveries}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentDispatcher.success_rate.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentDispatcher.rating.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active-deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Active Deliveries</CardTitle>
                <CardDescription>Track your current delivery assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {myDeliveryRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No active deliveries. Check available requests to get started!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myDeliveryRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                <span className="font-medium">Order #{request.order_id.slice(0, 8)}</span>
                                <Badge variant={
                                  request.status === 'assigned' ? 'secondary' :
                                  request.status === 'accepted' ? 'default' :
                                  request.status === 'delivered' ? 'outline' : 'destructive'
                                }>
                                  {request.status}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Pickup: {JSON.stringify(request.pickup_address)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Delivery: {JSON.stringify(request.delivery_address)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Fee: ${request.shipping_fee}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {request.status === 'assigned' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button onClick={() => setSelectedRequest(request)}>
                                      Accept Delivery
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Accept Delivery</DialogTitle>
                                      <DialogDescription>
                                        Confirm that you want to accept this delivery request
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="notes">Notes (optional)</Label>
                                        <Textarea
                                          id="notes"
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          placeholder="Any notes about the delivery..."
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedRequest(null);
                                            setNotes('');
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button onClick={() => handleAcceptDelivery(request.id)}>
                                          Accept Delivery
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              
                              {request.status === 'accepted' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button onClick={() => setSelectedRequest(request)}>
                                      Mark Delivered
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Complete Delivery</DialogTitle>
                                      <DialogDescription>
                                        Mark this delivery as completed
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="completion-notes">Delivery Notes</Label>
                                        <Textarea
                                          id="completion-notes"
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          placeholder="Delivery completion notes..."
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedRequest(null);
                                            setNotes('');
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button onClick={() => handleCompleteDelivery(request.id)}>
                                          Mark as Delivered
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="available-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Delivery Requests</CardTitle>
                <CardDescription>New delivery requests waiting for assignment</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending delivery requests at the moment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                <span className="font-medium">Order #{request.order_id.slice(0, 8)}</span>
                                <Badge variant="outline">Available</Badge>
                              </div>
                              
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Pickup: {JSON.stringify(request.pickup_address)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Delivery: {JSON.stringify(request.delivery_address)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Fee: ${request.shipping_fee}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Requested: {new Date(request.requested_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              disabled={!currentDispatcher.is_available}
                              onClick={() => {
                                // This would require admin/vendor assignment logic
                                toast({
                                  title: "Info",
                                  description: "Delivery requests are assigned by vendors/admin",
                                });
                              }}
                            >
                              {currentDispatcher.is_available ? 'Request Assignment' : 'Unavailable'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DispatchDashboard;