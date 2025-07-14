
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Leaf } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { items } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 overflow-hidden">
              <img 
                src="/lovable-uploads/b58904b8-8d81-4393-a765-af4fc0eea4f8.png" 
                alt="Pilot Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Pilot
              </span>
              <div className="text-xs text-slate-500 -mt-1">Premium Quality Products</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors duration-200 hover:text-green-600 ${
                isActive('/') ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-slate-700'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`text-sm font-medium transition-colors duration-200 hover:text-green-600 ${
                isActive('/products') ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-slate-700'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors duration-200 hover:text-green-600 ${
                isActive('/about') ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-slate-700'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors duration-200 hover:text-green-600 ${
                isActive('/contact') ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-slate-700'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Cart */}
            <Button variant="ghost" size="sm" asChild className="relative hover:bg-green-50">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5 text-slate-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                asChild 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
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
    </nav>
  );
};
