import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pilot</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <Link to="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-700">
                About
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-700">
                Contact
              </Link>
              {user ? (
                <Link to="/orders" className="text-gray-500 hover:text-gray-700">
                  Orders
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-gray-500 hover:text-gray-700 relative">
              Cart
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-1 text-xs">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <Button variant="outline" size="sm" onClick={() => {}}>
                {user.email}
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-3/4 md:w-2/5 lg:w-1/3">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through Pilot
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link to="/" className="text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                  <Link to="/products" className="text-gray-500 hover:text-gray-700">
                    Products
                  </Link>
                  <Link to="/about" className="text-gray-500 hover:text-gray-700">
                    About
                  </Link>
                  <Link to="/contact" className="text-gray-500 hover:text-gray-700">
                    Contact
                  </Link>
                  {user ? (
                    <Link to="/orders" className="text-gray-500 hover:text-gray-700">
                      Orders
                    </Link>
                  ) : null}
                  <Link to="/cart" className="text-gray-500 hover:text-gray-700 relative">
                    Cart
                    {items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-1 text-xs">
                        {items.length}
                      </span>
                    )}
                  </Link>
                  {user ? (
                    <Button variant="outline" size="sm" onClick={() => {}}>
                      {user.email}
                    </Button>
                  ) : (
                    <Link to="/auth">
                      <Button variant="outline" size="sm">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

    </nav>
  );
};
