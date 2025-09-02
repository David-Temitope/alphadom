import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopApplicationForm } from '@/components/ShopApplicationForm';
import { DispatchApplicationForm } from '@/components/DispatchApplicationForm';
import { useUserTypes } from '@/hooks/useUserTypes';
import { Store, Truck, User, CheckCircle } from 'lucide-react';

export const UserTypeSelection = () => {
  const { userTypes, addUserType, hasUserType, loading } = useUserTypes();
  const [showShopForm, setShowShopForm] = useState(false);
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  const handleAddUserType = async (type: 'regular' | 'vendor' | 'dispatch') => {
    if (type === 'vendor') {
      setShowShopForm(true);
    } else if (type === 'dispatch') {
      setShowDispatchForm(true);
    } else {
      await addUserType(type);
    }
  };

  if (loading) {
    return <div>Loading user types...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
        <p className="text-gray-600">Select how you want to participate in our marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Regular User */}
        <Card className="relative">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Regular User</CardTitle>
            <CardDescription>Browse and purchase products from vendors</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Browse all products</li>
              <li>• Make purchases</li>
              <li>• Write reviews</li>
              <li>• Create wishlists</li>
            </ul>
            {hasUserType('regular') ? (
              <Badge variant="default" className="w-full justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Active
              </Badge>
            ) : (
              <Button 
                onClick={() => handleAddUserType('regular')}
                variant="outline"
                className="w-full"
              >
                Become Regular User
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Vendor */}
        <Card className="relative border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Shop Owner</CardTitle>
            <CardDescription>Sell your products and manage your shop</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Sell products</li>
              <li>• Manage inventory</li>
              <li>• Process orders</li>
              <li>• Analytics dashboard</li>
            </ul>
            {hasUserType('vendor') ? (
              <Badge variant="default" className="w-full justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Active
              </Badge>
            ) : (
              <Button 
                onClick={() => handleAddUserType('vendor')}
                className="w-full"
              >
                Apply for Shop
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Dispatcher */}
        <Card className="relative">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Dispatcher</CardTitle>
            <CardDescription>Deliver products and earn money</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Accept delivery requests</li>
              <li>• Flexible schedule</li>
              <li>• Earn per delivery</li>
              <li>• Build reputation</li>
            </ul>
            {hasUserType('dispatch') ? (
              <Badge variant="default" className="w-full justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Active
              </Badge>
            ) : (
              <Button 
                onClick={() => handleAddUserType('dispatch')}
                variant="secondary"
                className="w-full"
              >
                Apply as Dispatcher
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Forms */}
      <ShopApplicationForm 
        open={showShopForm} 
        onOpenChange={setShowShopForm}
      />
      
      <DispatchApplicationForm 
        open={showDispatchForm} 
        onOpenChange={setShowDispatchForm}
      />
    </div>
  );
};