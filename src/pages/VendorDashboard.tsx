import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  Edit,
  Trash2,
  AlertTriangle,
  CreditCard,
  LayoutDashboard,
  Settings,
  Camera,
  RefreshCw,
  Plus,
  Search,
  Bell,
  MessageSquare,
  Menu,
  Eye,
  Star,
  DollarSign,
  Users,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VendorProductForm } from "@/components/VendorProductForm";
import { VendorProductEditForm } from "@/components/VendorProductEditForm";
import { VendorSubscription } from "@/components/VendorSubscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MarketResearch } from "@/components/vendor/MarketResearch";

type ActiveTab = "dashboard" | "products" | "orders" | "settings" | "subscription" | "market-research";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { currentVendor, isVendor, refreshVendors } = useVendors();
  const { products, refreshProducts } = useProducts();
  const { orders } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const vendorProducts = products.filter((p) => p.vendor_user_id === user?.id);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get vendor orders - filter by vendor_id
  const vendorOrders = orders.filter((order) => order.vendor_id === currentVendor?.id);

  // Calculate earnings (revenue - commission)
  const commissionRate = currentVendor?.commission_rate || 15;
  const totalRevenue = currentVendor?.total_revenue || 0;
  const platformCommission = totalRevenue * (commissionRate / 100);
  const vendorEarnings = totalRevenue - platformCommission;

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      refreshProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleProfileImageUpload = async (imageUrl: string) => {
    if (!user) return;

    setUploadingImage(true);
    try {
      const { error } = await supabase.from("profiles").update({ avatar_url: imageUrl }).eq("id", user.id);

      if (error) throw error;

      setProfileImage(imageUrl);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverImageUpload = async (imageUrl: string) => {
    if (!currentVendor) return;

    setUploadingCover(true);
    try {
      const { error } = await supabase
        .from("approved_vendors")
        .update({ cover_image: imageUrl })
        .eq("id", currentVendor.id);

      if (error) throw error;

      setCoverImage(imageUrl);
      toast({
        title: "Success",
        description: "Cover image updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cover image",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // Fetch current profile image and cover image on mount
  React.useEffect(() => {
    const fetchImages = async () => {
      if (!user) return;
      
      // Fetch profile image
      const { data: profileData } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();
      if (profileData?.avatar_url) {
        setProfileImage(profileData.avatar_url);
      }
      
      // Fetch cover image from vendor
      if (currentVendor?.id) {
        const { data: vendorData } = await supabase
          .from("approved_vendors")
          .select("cover_image")
          .eq("id", currentVendor.id)
          .single();
        if (vendorData?.cover_image) {
          setCoverImage(vendorData.cover_image);
        }
      }
    };
    fetchImages();
  }, [user, currentVendor?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to access your vendor dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVendor || !currentVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">You don't have vendor access. Please apply for a shop first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if vendor is suspended
  const isSuspended = currentVendor.is_suspended === true;
  const isInactive = !currentVendor.is_active;

  // Check product limit
  const productLimit = (currentVendor as any).product_limit || 20;
  const canAddProduct = productLimit === -1 || vendorProducts.length < productLimit;

  const sidebarItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "market-research" as const, label: "Market Insights", icon: TrendingUp },
    { id: "settings" as const, label: "Store Settings", icon: Settings },
    { id: "subscription" as const, label: "Subscription", icon: CreditCard },
  ];

  const handleNavigation = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Alphadom</h2>
            <p className="text-xs text-muted-foreground">Vendor Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Add Product Button */}
      <div className="p-4 border-t border-border">
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full gap-2" 
              disabled={isSuspended || isInactive || !canAddProduct}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {isSuspended || isInactive ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cannot Add Products</AlertTitle>
                <AlertDescription>
                  Your shop is currently suspended. Please renew your subscription or contact support.
                </AlertDescription>
              </Alert>
            ) : !canAddProduct ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Product Limit Reached</AlertTitle>
                <AlertDescription>
                  You've reached your product limit ({productLimit} products). Upgrade your subscription to add more products.
                </AlertDescription>
              </Alert>
            ) : (
              <VendorProductForm 
                onProductAdded={() => {
                  refreshProducts();
                  setAddProductOpen(false);
                }} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-primary/10 text-primary";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "shipped":
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-card h-screen sticky top-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg md:text-xl font-semibold text-foreground">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "products" && "My Products"}
              {activeTab === "orders" && "Orders"}
              {activeTab === "market-research" && "Market Insights"}
              {activeTab === "settings" && "Store Settings"}
              {activeTab === "subscription" && "Subscription"}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - Desktop only */}
            {!isMobile && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50"
                />
              </div>
            )}


            {/* Avatar only on mobile header */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileImage || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {currentVendor.store_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <div className="text-right">
                  <p className="text-sm font-medium">{currentVendor.store_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentVendor.subscription_plan?.replace("_", " ") || "Free"} Vendor
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Suspension/Inactive Alert */}
          {(isSuspended || isInactive) && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Shop Suspended</AlertTitle>
              <AlertDescription>
                Your account has been suspended. This is either because your subscription plan has expired or you violated a rule. Please contact our support team for more information.
              </AlertDescription>
            </Alert>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Sales</span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      ₦{vendorEarnings.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">+12.5%</span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {currentVendor.total_orders}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">+8.2%</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Visitors</span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {vendorProducts.reduce((acc, p) => acc + (p.total_orders || 0), 0) * 15}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">+15.3%</span>
                      <span className="text-xs text-muted-foreground">total sessions</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {vendorProducts.length > 0 
                        ? (vendorProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / vendorProducts.length).toFixed(1)
                        : "0"}/5
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronUp className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">+0.2%</span>
                      <span className="text-xs text-muted-foreground">{vendorProducts.reduce((acc, p) => acc + (p.reviews || 0), 0)} reviews</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Sales Performance Chart Placeholder */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Sales Performance</CardTitle>
                        <CardDescription>Revenue growth over the last 7 days</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="text-xs h-8">Weekly</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-8">Monthly</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground text-sm">Sales chart visualization</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Card & Store Health */}
                <div className="space-y-4">
                  <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">Upgrade to Plus</h3>
                      <p className="text-sm opacity-90 mb-3">
                        Unlock advanced analytics and lower commission fees on every sale.
                      </p>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setActiveTab("subscription")}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Store Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Processing Time</span>
                          <span className="font-medium text-primary">Fast</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Return Rate</span>
                          <span className="font-medium text-foreground">1.2%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Orders</CardTitle>
                      <CardDescription>Displaying the last 5 transactions</CardDescription>
                    </div>
                    <Button 
                      variant="link" 
                      className="text-primary p-0 h-auto"
                      onClick={() => setActiveTab("orders")}
                    >
                      View All Orders
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {vendorOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ORDER ID</TableHead>
                          <TableHead>CUSTOMER</TableHead>
                          <TableHead>DATE</TableHead>
                          <TableHead>AMOUNT</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorOrders.slice(0, 5).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-muted text-xs">
                                    U
                                  </AvatarFallback>
                                </Avatar>
                                <span>Customer</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(order.created_at || ""), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₦{order.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("font-normal", getStatusColor(order.status))}>
                                {order.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground">
                    {vendorProducts.length}{productLimit !== -1 ? `/${productLimit}` : ""} products
                  </p>
                </div>
                <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gap-2" 
                      disabled={isSuspended || isInactive || !canAddProduct}
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    {isSuspended || isInactive ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Cannot Add Products</AlertTitle>
                        <AlertDescription>
                          Your shop is currently suspended. Please renew your subscription or contact support.
                        </AlertDescription>
                      </Alert>
                    ) : !canAddProduct ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Product Limit Reached</AlertTitle>
                        <AlertDescription>
                          You've reached your product limit ({productLimit} products). Upgrade your subscription to add more products.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <VendorProductForm 
                        onProductAdded={() => {
                          refreshProducts();
                          setAddProductOpen(false);
                        }} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {vendorProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No products added yet. Add your first product to get started!
                    </p>
                    <Button onClick={() => setAddProductOpen(true)} disabled={isSuspended || isInactive || !canAddProduct}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorProducts.map((product) => {
                    const isOutOfStock = !product.in_stock || (product.stock_count || 0) <= 0;
                    return (
                      <Card key={product.id} className={cn(isOutOfStock && "border-destructive/50 bg-destructive/5")}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {isOutOfStock && (
                              <Alert variant="destructive" className="py-2">
                                <AlertTriangle className="h-3 w-3" />
                                <AlertDescription className="text-xs">
                                  Out of stock! Restock within 7 days or product will be deleted.
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                {product.image && (
                                  <img 
                                    src={product.image.startsWith("[") ? JSON.parse(product.image)[0] : product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{product.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-bold text-primary">₦{product.price.toLocaleString()}</span>
                                  <Badge variant={product.in_stock ? "default" : "destructive"} className="text-xs">
                                    Stock: {product.stock_count}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                disabled={isSuspended || isInactive}
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {isOutOfStock && (
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  className="flex-1"
                                  disabled={isSuspended || isInactive}
                                  onClick={() => setEditingProduct(product)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Restock
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={isSuspended || isInactive}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Edit Product Dialog */}
              {editingProduct && (
                <VendorProductEditForm
                  product={editingProduct}
                  open={!!editingProduct}
                  onClose={() => setEditingProduct(null)}
                  onProductUpdated={refreshProducts}
                />
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage orders for your products</CardDescription>
                </CardHeader>
                <CardContent>
                  {vendorOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ORDER ID</TableHead>
                          <TableHead>CUSTOMER</TableHead>
                          <TableHead>DATE</TableHead>
                          <TableHead>AMOUNT</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-muted text-xs">
                                    U
                                  </AvatarFallback>
                                </Avatar>
                                <span>Customer</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(order.created_at || ""), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₦{order.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("font-normal", getStatusColor(order.status))}>
                                {order.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <div className="mt-4">
                    <Button onClick={() => navigate("/vendor-orders")}>
                      View Full Order Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Store Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Cover Image Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Cover Image</CardTitle>
                  <CardDescription>This banner image appears on your store page in the vendor directory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-48 rounded-xl bg-muted overflow-hidden border-2 border-dashed border-border">
                    {coverImage ? (
                      <img src={coverImage} alt="Store cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No cover image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="max-w-sm">
                    <Label className="mb-2 block">Upload Cover Image (Recommended: 1200x300)</Label>
                    <ImageUpload onImageUploaded={handleCoverImageUpload} />
                    {uploadingCover && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Store Profile
                  </CardTitle>
                  <CardDescription>Manage your store profile and picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-primary/20">
                        {profileImage ? (
                          <img src={profileImage} alt={currentVendor.store_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-muted-foreground">
                            {currentVendor.store_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-semibold">{currentVendor.store_name}</h3>
                      <p className="text-muted-foreground">{currentVendor.product_category}</p>
                    </div>

                    <div className="w-full max-w-sm">
                      <Label className="mb-2 block">Update Profile Picture</Label>
                      <ImageUpload onImageUploaded={handleProfileImageUpload} />
                      {uploadingImage && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-muted-foreground">Store Name</Label>
                      <p className="font-medium">{currentVendor.store_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{currentVendor.product_category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Products</Label>
                      <p className="font-medium">{vendorProducts.length}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Orders</Label>
                      <p className="font-medium">{currentVendor.total_orders}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Member Since</Label>
                      <p className="font-medium">{new Date(currentVendor.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Subscription Plan</Label>
                      <Badge variant="default">
                        {currentVendor.subscription_plan?.replace("_", " ").toUpperCase() || "FREE"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Market Research Tab */}
          {activeTab === "market-research" && (
            <MarketResearch />
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <VendorSubscription onPlanChange={() => refreshVendors()} />
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
