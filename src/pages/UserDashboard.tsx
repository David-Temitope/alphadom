import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Heart, MapPin, CreditCard, 
  Settings, LogOut, Gift, Ticket, Package, ChevronRight,
  ShoppingCart, Star, Loader2, Store
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useVendors } from '@/hooks/useVendors';
import { useShopApplications } from '@/hooks/useShopApplications';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileAccountPage from '@/components/MobileAccountPage';
import { useSEO } from '@/hooks/useSEO';

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  action?: () => void;
};

const UserDashboard = () => {
  useSEO({
    title: "Account Dashboard",
    noindex: true,
  });
  const { user, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { wishlistItems } = useWishlist();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isVendor } = useVendors();
  const { userApplication } = useShopApplications();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  
  // Check if user can become a seller
  const canBecomeVendor = !isVendor && !userApplication;

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch order items for recent orders
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (orders.length === 0) return;

      const recentOrderIds = orders.slice(0, 5).map(o => o.id);
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products:product_id (
            id,
            name,
            image,
            price
          )
        `)
        .in('order_id', recentOrderIds);

      if (!error && data) {
        const itemsByOrder: Record<string, any[]> = {};
        data.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        });
        setOrderItems(itemsByOrder);
      }
    };

    fetchOrderItems();
  }, [orders]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Sidebar navigation items
  const userAccountItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, href: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { id: 'address', label: 'Address Book', icon: MapPin, href: '/address-book' },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, href: '/dashboard' },
  ];

  const settingsItems: SidebarItem[] = [
    { id: 'settings', label: 'Account Settings', icon: Settings, href: '/settings' },
    { id: 'logout', label: 'Logout', icon: LogOut, action: handleLogout },
  ];

  // Stats calculated from real data
  const stats = useMemo(() => ({
    totalOrders: orders.length,
    pointsEarned: Math.floor(orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) / 100),
    couponsAvailable: 0, // Would come from a coupons table if implemented
  }), [orders]);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Recommended products based on order history categories or random if no orders
  const recommendedProducts = useMemo(() => {
    if (orders.length === 0) {
      return products.slice(0, 3);
    }
    // Get categories from ordered products and recommend similar
    return products.slice(0, 3);
  }, [products, orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'shipped':
        return 'bg-accent text-accent-foreground';
      case 'processing':
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDisplayImage = (imageField: string | null) => {
    if (!imageField) return '/placeholder.svg';
    try {
      const images = JSON.parse(imageField);
      return Array.isArray(images) && images.length > 0 ? images[0] : imageField;
    } catch {
      return imageField;
    }
  };

  const getOrderDisplayProduct = (orderId: string) => {
    const items = orderItems[orderId];
    if (!items || items.length === 0) return null;
    return items[0].products;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (profileLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';

  // Render mobile version
  if (isMobile) {
    return <MobileAccountPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border/50 bg-card min-h-screen sticky top-0">
          <div className="p-6">
            {/* User Account Section */}
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                User Account
              </p>
              <nav className="space-y-1">
                {userAccountItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href || '#'}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Settings Section */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Settings
              </p>
              <nav className="space-y-1">
                {settingsItems.map((item) => (
                  item.action ? (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      to={item.href || '#'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Hello, {firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Check your latest updates and order status below.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Points Earned */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Points Earned
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {stats.pointsEarned.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupons */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Coupons
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.couponsAvailable} Available
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Package className="h-6 w-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="border-border/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
                <Link 
                  to="/orders" 
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button asChild className="mt-4">
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3">Order ID</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3">Product</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3 hidden md:table-cell">Date</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3">Total</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const displayProduct = getOrderDisplayProduct(order.id);
                        
                        return (
                          <tr key={order.id} className="border-b border-border/30 last:border-0">
                            <td className="py-4">
                              <span className="text-sm font-medium text-foreground">
                                #AD-{order.id.slice(0, 5).toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                                  <img
                                    src={displayProduct ? getDisplayImage(displayProduct.image) : '/placeholder.svg'}
                                    alt={displayProduct?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-sm text-foreground line-clamp-1">
                                  {displayProduct?.name || 'Order items'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(order.created_at || '')}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="text-sm font-medium text-foreground">
                                {formatPrice(Number(order.total_amount))}
                              </span>
                            </td>
                            <td className="py-4">
                              <Badge className={`${getStatusColor(order.status)} text-xs font-medium`}>
                                • {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <Link 
                                to={`/orders`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {order.status === 'shipped' ? 'Track' : 'Invoice'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Section - Recommendations & Referral */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended for You */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
                  <button className="text-muted-foreground hover:text-foreground">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>

                {recommendedProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recommendations yet</p>
                ) : (
                  <div className="space-y-4">
                    {recommendedProducts.slice(0, 2).map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={getDisplayImage(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Based on your recent search
                          </p>
                          <p className="text-sm font-bold text-primary mt-1">
                            {formatPrice(Number(product.price))}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image: getDisplayImage(product.image),
                            quantity: 1
                          })}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Become a Seller / Refer & Earn */}
            {canBecomeVendor ? (
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Start Selling on Alphadom!</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Turn your products into profit. Apply to become a vendor and reach thousands of buyers.
                  </p>
                  <Link to="/become-a-vendor">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Store className="h-4 w-4 mr-2" />
                      Become a Seller
                    </Button>
                  </Link>
                  
                  {/* Decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20">
                    <Store className="w-full h-full text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Refer & Earn!</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite your friends and get ₦500 for every successful purchase.
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Referral Link
                  </Button>
                  
                  {/* Decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20">
                    <Gift className="w-full h-full text-primary" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
