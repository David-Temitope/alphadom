import React, { useState } from "react";
import { User, LogOut, ShoppingBag, Settings, Heart, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useShopApplications } from "@/hooks/useShopApplications";
import { useVendors } from "@/hooks/useVendors";
import { useDispatchApplications } from "@/hooks/useDispatchApplications";
import { useDispatchers } from "@/hooks/useDispatchers";
import { ShopApplicationForm } from "./ShopApplicationForm";

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
    return email.split("@")[0];
  };

  try {
    return (
      <>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full transition-all duration-200 hover:scale-105"
          onClick={() => window.location.href = '/dashboard'}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email || "")}
            </AvatarFallback>
          </Avatar>
        </Button>

        <ShopApplicationForm open={showShopForm} onOpenChange={setShowShopForm} />
      </>
    );
  } catch (error) {
    console.error("Error rendering UserMenu:", error);
    return null;
  }
};
