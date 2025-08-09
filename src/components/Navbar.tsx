
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';
export const Navbar = () => {
  const { items } = useCart();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 overflow-hidden">
                <img 
                  src={settings.navbar_logo || "/lovable-uploads/b58904b8-8d81-4393-a765-af4fc0eea4f8.png"} 
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

            {/* Navigation Links - Desktop */}
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
            </div>

            {/* Right Side Actions */}
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

              {/* User Menu */}
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
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
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
