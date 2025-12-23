import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useUserTypes } from '@/hooks/useUserTypes';
import { useShopApplications } from '@/hooks/useShopApplications';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAdmin } from '@/contexts/AdminContext';

export const Navbar = () => {
  const { items } = useCart();
  const { user } = useAuth();
  const { admin } = useAdmin();
  const { settings } = useAdminSettings();
  const { hasUserType } = useUserTypes();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const UserTypeNavLink = () => {
    const { userApplication } = useShopApplications();
    
    // Only show link if user is vendor, dispatch, or has application pending
    if (hasUserType('vendor')) {
      return (
        <Link 
          to="/vendor-dashboard" 
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
            isActive('/vendor-dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
          }`}
        >
          My Shop
        </Link>
      );
    } else if (hasUserType('dispatch')) {
      return (
        <Link 
          to="/dispatch-dashboard" 
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
            isActive('/dispatch-dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
          }`}
        >
          My Dashboard
        </Link>
      );
    } else if (userApplication) {
      return (
        <Link 
          to="/shop-application-status" 
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
            isActive('/shop-application-status') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
          }`}
        >
          Application Status
        </Link>
      );
    }
    // Don't show anything for regular users - they see "Start Selling" in hero
    return null;
  };
  
  const UserTypeNavLinkMobile = () => {
    const { userApplication } = useShopApplications();
    
    // Only show link if user is vendor, dispatch, or has application pending
    if (hasUserType('vendor')) {
      return (
        <Link 
          to="/vendor-dashboard" 
          className={`block py-2 px-4 rounded-lg transition-colors ${
            isActive('/vendor-dashboard') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          My Shop
        </Link>
      );
    } else if (hasUserType('dispatch')) {
      return (
        <Link 
          to="/dispatch-dashboard" 
          className={`block py-2 px-4 rounded-lg transition-colors ${
            isActive('/dispatch-dashboard') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          My Dashboard
        </Link>
      );
    } else if (userApplication) {
      return (
        <Link 
          to="/shop-application-status" 
          className={`block py-2 px-4 rounded-lg transition-colors ${
            isActive('/shop-application-status') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Application Status
        </Link>
      );
    }
    // Don't show anything for regular users
    return null;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Now on the far left, hidden on desktop (md:hidden removed) */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-10 rounded-xl flex items-center justify-center transition-all duration-200 overflow-hidden">
                <img 
                  src={settings.navbar_logo || "/favicon.png"} 
                  alt={`${settings.site_name} Logo`} 
                  className="h-8 w-auto object-contain max-w-[120px]"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {settings.site_name}
                </span>
                <div className="text-xs text-muted-foreground -mt-1">{settings.site_description}</div>
              </div>
            </Link>

            {/* Navigation Links - Desktop (Center) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive('/') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive('/products') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`}
              >
                Products
              </Link>
              <Link 
                to="/pilots" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive('/pilots') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`}
              >
                Pilots
              </Link>
              {user && (
                <UserTypeNavLink />
              )}
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive('/about') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive('/contact') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                }`}
              >
                Contact
              </Link>
              {admin && (
                <Link 
                  to="/appleisgood" 
                  className={`text-sm font-medium transition-colors duration-200 hover:text-primary flex items-center gap-1 ${
                    isActive('/appleisgood') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions (Cart, Notifications, User Menu, Mobile Menu Button) */}
            <div className="flex items-center space-x-4">
              
              {/* Cart */}
              <Button variant="ghost" size="sm" asChild className="relative hover:bg-accent">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* User Menu - Hidden on mobile */}
              <div className="hidden md:block">
                {user ? (
                  <UserMenu />
                ) : (
                  <Button 
                    asChild 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link to="/auth" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
              
              {/* Mobile Menu Button - Now on the far right on mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden" // Only visible on mobile
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (remains the same) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-xl">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">Menu</span>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Link 
                  to="/" 
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    isActive('/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    isActive('/products') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  to="/pilots" 
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    isActive('/pilots') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pilots
                </Link>
                {user && (
                  <UserTypeNavLinkMobile />
                )}
                <Link 
                  to="/about" 
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    isActive('/about') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`block py-2 px-4 rounded-lg transition-colors ${
                    isActive('/contact') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                {admin && (
                  <Link 
                    to="/appleisgood" 
                    className={`block py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/appleisgood') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                
                {user ? (
                  <UserMenu />
                ) : (
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/auth" className="flex items-center justify-center">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};