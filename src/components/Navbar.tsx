import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, Menu, X, Shield, ChevronDown, ChevronUp, LogOut, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTypes } from "@/hooks/useUserTypes";
import { useShopApplications } from "@/hooks/useShopApplications";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const { admin } = useAdmin();
  const { hasUserType } = useUserTypes();
  const { toast } = useToast();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const UserTypeNavLink = () => {
    const { userApplication } = useShopApplications();

    if (hasUserType("vendor")) {
      return (
        <Link
          to="/vendor-dashboard"
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
            isActive("/vendor-dashboard") ? "text-primary" : "text-foreground"
          }`}
        >
          My Shop
        </Link>
      );
    } else if (hasUserType("dispatch")) {
      return (
        <Link
          to="/dispatch-dashboard"
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
            isActive("/dispatch-dashboard") ? "text-primary" : "text-foreground"
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
            isActive("/shop-application-status") ? "text-primary" : "text-foreground"
          }`}
        >
          Application Status
        </Link>
      );
    }
    return null;
  };

  const UserTypeNavLinkMobile = () => {
    const { userApplication } = useShopApplications();

    if (hasUserType("vendor")) {
      return (
        <Link
          to="/vendor-dashboard"
          className={`block py-2.5 px-4 rounded-lg transition-colors ${
            isActive("/vendor-dashboard") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          My Shop
        </Link>
      );
    } else if (hasUserType("dispatch")) {
      return (
        <Link
          to="/dispatch-dashboard"
          className={`block py-2.5 px-4 rounded-lg transition-colors ${
            isActive("/dispatch-dashboard") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
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
          className={`block py-2.5 px-4 rounded-lg transition-colors ${
            isActive("/shop-application-status")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Application Status
        </Link>
      );
    }
    return null;
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Shop" },
    { path: "/pilots", label: "Vendors" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Alphadom
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                    isActive(link.path) && link.path !== "/" 
                      ? "text-primary" 
                      : location.pathname === "/" && link.path === "/"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && <UserTypeNavLink />}
              {admin && (
                <Link
                  to="/appleisgood"
                  className={`text-sm font-medium transition-colors duration-200 hover:text-primary flex items-center gap-1.5 ${
                    isActive("/appleisgood") ? "text-primary" : "text-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search - Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-9 h-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </form>

              {/* Cart */}
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* User Menu - Desktop */}
              <div className="hidden md:block">
                {user ? (
                  <UserMenu />
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                  >
                    <Link to="/auth" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-background border-r border-border shadow-xl overflow-y-auto animate-slide-in-left">
            <div className="p-5 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold">Alphadom</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 bg-secondary border-0"
                  />
                </div>
              </form>

              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-2.5 px-4 rounded-lg transition-colors font-medium ${
                      isActive(link.path) && link.path !== "/"
                        ? "bg-primary text-primary-foreground"
                        : location.pathname === "/" && link.path === "/"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Profile Dropdown for logged in users */}
                {user && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="w-full flex items-center justify-between py-2.5 px-4 rounded-lg transition-colors text-foreground hover:bg-secondary font-medium"
                    >
                      <span>My Account</span>
                      {isProfileDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="ml-4 space-y-1 border-l-2 border-border pl-4">
                        <Link
                          to="/orders"
                          className="block py-2 px-3 rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block py-2 px-3 rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Wishlist
                        </Link>
                        <Link
                          to="/settings"
                          className="block py-2 px-3 rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <UserTypeNavLinkMobile />
                      </div>
                    )}
                  </div>
                )}

                {admin && (
                  <Link
                    to="/appleisgood"
                    className={`block py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                      isActive("/appleisgood")
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
              </div>

              {/* Auth Section */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/auth" className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
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
