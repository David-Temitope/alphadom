import React, { useState } from 'react';
import { User, LogOut, ShoppingBag, Settings, Heart, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useVendors } from '@/hooks/useVendors';
import { useDispatchApplications } from '@/hooks/useDispatchApplications';
import { useDispatchers } from '@/hooks/useDispatchers';
import { ShopApplicationForm } from './ShopApplicationForm';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { userApplication: shopApplication } = useShopApplications();
  const { userApplication: dispatchApplication } = useDispatchApplications();
  const { isVendor } = useVendors();
  const { currentDispatcher } = useDispatchers();
  const [showShopForm, setShowShopForm] = useState(false);

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  try {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full transition-all duration-200 hover:scale-105"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 animate-in slide-in-from-top-2" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName(user.email || '')}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/orders" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/wishlist" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                <span>My Wishlist</span>
              </Link>
            </DropdownMenuItem>
            
            {/* Shop/Dispatch Application/Status */}
            {shopApplication && !isVendor && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/shop-status">
                  <Store className="mr-2 h-4 w-4" />
                  Shop Application Status
                </Link>
              </DropdownMenuItem>
            )}
            
            {dispatchApplication && !currentDispatcher && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/user-type-selection">
                  <Store className="mr-2 h-4 w-4" />
                  Dispatch Application Status
                </Link>
              </DropdownMenuItem>
            )}
            
            {isVendor && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/vendor-dashboard">
                  <Store className="mr-2 h-4 w-4" />
                  My Shop Dashboard
                </Link>
              </DropdownMenuItem>
            )}

            {currentDispatcher && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dispatch-dashboard">
                  <Store className="mr-2 h-4 w-4" />
                  My Dispatch Dashboard
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ShopApplicationForm 
          open={showShopForm} 
          onOpenChange={setShowShopForm} 
        />
      </>
    );
  } catch (error) {
    console.error('Error rendering UserMenu:', error);
    return null;
  }
};