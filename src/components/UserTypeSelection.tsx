import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopApplicationForm } from '@/components/ShopApplicationForm';
import { DispatchApplicationForm } from '@/components/DispatchApplicationForm';
import { useUserTypes } from '@/hooks/useUserTypes';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useDispatchApplications } from '@/hooks/useDispatchApplications';
import { Store, Truck, User, CheckCircle, RotateCcw } from 'lucide-react';

export const UserTypeSelection = () => {
  const { userTypes, addUserType, hasUserType, loading } = useUserTypes();
  const { userApplication: shopApplication, deleteApplication: deleteShopApplication } = useShopApplications();
  const { userApplication: dispatchApplication, deleteApplication: deleteDispatchApplication } = useDispatchApplications();
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : hasUserType('dispatch') ? (
              <Badge variant="outline" className="w-full justify-center">
                Cannot have multiple roles
              </Badge>
            ) : shopApplication?.status === 'rejected' ? (
              <div className="space-y-2">
                <Badge variant="destructive" className="w-full justify-center">
                  Application Rejected
                </Badge>
                <Button 
                  onClick={() => deleteShopApplication?.(shopApplication.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reapply
                </Button>
              </div>
            ) : shopApplication ? (
              <Badge variant="outline" className="w-full justify-center">
                Application {shopApplication.status}
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
        <Card className="relative border-yellow-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Dispatcher</CardTitle>
            <CardDescription>Deliver products and earn money</CardDescription>
            <Badge variant="outline" className="mt-2 bg-yellow-50 border-yellow-300 text-yellow-800">
              Currently Not Available
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                ℹ️ We don't handle dispatch services at the moment. This feature will be available soon!
              </p>
            </div>
            <ul className="text-sm text-gray-600 mb-4 space-y-1 opacity-50">
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
            ) : hasUserType('vendor') ? (
              <Badge variant="outline" className="w-full justify-center">
                Cannot have multiple roles
              </Badge>
            ) : dispatchApplication?.status === 'rejected' ? (
              <div className="space-y-2">
                <Badge variant="destructive" className="w-full justify-center">
                  Application Rejected
                </Badge>
                <Button 
                  onClick={() => deleteDispatchApplication?.(dispatchApplication.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reapply
                </Button>
              </div>
            ) : dispatchApplication ? (
              <Badge variant="outline" className="w-full justify-center">
                Application {dispatchApplication.status}
              </Badge>
            ) : (
              <Button 
                onClick={() => handleAddUserType('dispatch')}
                variant="secondary"
                className="w-full"
                disabled
              >
                Coming Soon
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