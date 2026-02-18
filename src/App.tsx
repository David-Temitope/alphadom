
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GideonChat } from "@/components/GideonChat";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminShopApplications from "./pages/admin/AdminShopApplications";
import AdminDispatchApplications from "./pages/admin/AdminDispatchApplications";
import AdminDispatchMonitoring from "./pages/admin/AdminDispatchMonitoring";
import AdminVendorMonitoring from "./pages/admin/AdminVendorMonitoring";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminReports from "./pages/admin/AdminReports";
import AdminAdverts from "./pages/admin/AdminAdverts";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import DeliveryPolicy from "./pages/DeliveryPolicy";
import DisputePolicy from "./pages/DisputePolicy";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import ShopApplicationStatus from "./pages/ShopApplicationStatus";
import DispatchApplicationStatus from "./pages/DispatchApplicationStatus";
import VendorDashboard from "./pages/VendorDashboard";
import UserTypeSelection from "./pages/UserTypeSelection";
import UserSettings from "./pages/UserSettings";
import UserDashboard from "./pages/UserDashboard";
import Pilots from "./pages/Pilots";
import { VendorProfile } from "./pages/VendorProfile";
import DispatchDashboard from "./pages/DispatchDashboard";
import DispatchSelection from "./pages/DispatchSelection";
import VendorOrders from "./pages/VendorOrders";
import DispatchProfile from "./pages/DispatchProfile";
import CategoryProducts from "./pages/CategoryProducts";
import Sitemap from "./pages/Sitemap";
import ResetPassword from "./pages/ResetPassword";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/admin/AdminBlog";
import BecomeAVendor from "./pages/BecomeAVendor";
import AddressBook from "./pages/AddressBook";
// Create QueryClient outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pb-16 md:pb-0">{children}</main>
    <div className="hidden md:block">
      <Footer />
    </div>
    <MobileBottomNav />
  </div>
);

const App = () => {
  console.log('App component rendering');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <AdminProvider>
              <BrowserRouter>
                <ScrollToTop />
                <div className="App">
                  <GideonChat />
                  <Toaster />
                  <Sonner />
                  <Routes>
                      {/* Auth Routes */}
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Public Routes */}
                      <Route path="/" element={<Layout><Index /></Layout>} />
                      <Route path="/products" element={<Layout><Products /></Layout>} />
                      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                      <Route path="/cart" element={<Layout><Cart /></Layout>} />
                      <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                      <Route path="/orders" element={<Layout><Orders /></Layout>} />
                      <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                      <Route path="/shop-application-status" element={<Layout><ShopApplicationStatus /></Layout>} />
                      <Route path="/dispatch-status" element={<Layout><DispatchApplicationStatus /></Layout>} />
                      <Route path="/vendor-dashboard" element={<Layout><VendorDashboard /></Layout>} />
                      <Route path="/vendor-orders" element={<Layout><VendorOrders /></Layout>} />
                      <Route path="/user-types" element={<Layout><UserTypeSelection /></Layout>} />
                      <Route path="/category/:category" element={<Layout><CategoryProducts /></Layout>} />
                      <Route path="/pilots" element={<Layout><Pilots /></Layout>} />
                      <Route path="/become-a-vendor" element={<Layout><BecomeAVendor /></Layout>} />
                      <Route path="/pilot/:vendorId" element={<Layout><VendorProfile /></Layout>} />
                      <Route path="/vendor/:vendorId" element={<Layout><VendorProfile /></Layout>} />
                      <Route path="/dispatcher/:dispatchId" element={<Layout><DispatchProfile /></Layout>} />
                      <Route path="/dispatch-dashboard" element={<Layout><DispatchDashboard /></Layout>} />
                      <Route path="/dispatch-selection/:orderId" element={<Layout><DispatchSelection /></Layout>} />
                      <Route path="/settings" element={<Layout><UserSettings /></Layout>} />
                      <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
                      <Route path="/address-book" element={<Layout><AddressBook /></Layout>} />
                      <Route path="/sitemap" element={<Sitemap />} />
                      <Route path="/blog" element={<Layout><Blog /></Layout>} />
                      <Route path="/blog/:id" element={<Layout><BlogPost /></Layout>} />
                      <Route path="/about" element={<Layout><About /></Layout>} />
                      <Route path="/contact" element={<Layout><Contact /></Layout>} />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/products" element={
                        <AdminProtectedRoute allowedRoles={['orders_admin']}>
                          <AdminProducts />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/orders" element={
                        <AdminProtectedRoute allowedRoles={['orders_admin']}>
                          <AdminOrders />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/users" element={
                        <AdminProtectedRoute allowedRoles={['user_admin']}>
                          <AdminUsers />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/settings" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminSettings />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/analytics" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminAnalytics />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/applications" element={
                        <AdminProtectedRoute allowedRoles={['vendor_admin']}>
                          <AdminShopApplications />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/dispatch-applications" element={
                        <AdminProtectedRoute allowedRoles={['dispatch_admin']}>
                          <AdminDispatchApplications />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/vendor-monitoring" element={
                        <AdminProtectedRoute allowedRoles={['vendor_admin']}>
                          <AdminVendorMonitoring />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/dispatch-monitoring" element={
                        <AdminProtectedRoute allowedRoles={['dispatch_admin']}>
                          <AdminDispatchMonitoring />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/admin-management" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminManagement />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/transactions" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminTransactions />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/reports" element={
                        <AdminProtectedRoute allowedRoles={['super_admin', 'user_admin', 'customer_service']}>
                          <AdminReports />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/newsletter" element={
                        <AdminProtectedRoute allowedRoles={['super_admin', 'customer_service']}>
                          <AdminNewsletter />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/adverts" element={
                        <AdminProtectedRoute allowedRoles={['super_admin', 'vendor_admin', 'orders_admin']}>
                          <AdminAdverts />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/admin/blog" element={
                        <AdminProtectedRoute allowedRoles={['super_admin', 'customer_service']}>
                          <AdminBlog />
                        </AdminProtectedRoute>
                      } />

                      {/* Terms, Privacy and Policy Routes */}
                      <Route path="/terms" element={<Layout><Terms /></Layout>} />
                      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                      <Route path="/refund-policy" element={<Layout><RefundPolicy /></Layout>} />
                      <Route path="/return-policy" element={<Layout><ReturnPolicy /></Layout>} />
                      <Route path="/delivery-policy" element={<Layout><DeliveryPolicy /></Layout>} />
                      <Route path="/dispute-policy" element={<Layout><DisputePolicy /></Layout>} />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </AdminProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;
