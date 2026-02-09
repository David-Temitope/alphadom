
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GideonChat } from "@/components/GideonChat";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { GenericPageSkeleton } from "@/components/skeletons/PageSkeletons";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminShopApplications = lazy(() => import("./pages/admin/AdminShopApplications"));
const AdminDispatchApplications = lazy(() => import("./pages/admin/AdminDispatchApplications"));
const AdminDispatchMonitoring = lazy(() => import("./pages/admin/AdminDispatchMonitoring"));
const AdminVendorMonitoring = lazy(() => import("./pages/admin/AdminVendorMonitoring"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminAdverts = lazy(() => import("./pages/admin/AdminAdverts"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const DeliveryPolicy = lazy(() => import("./pages/DeliveryPolicy"));
const DisputePolicy = lazy(() => import("./pages/DisputePolicy"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const ShopApplicationStatus = lazy(() => import("./pages/ShopApplicationStatus"));
const DispatchApplicationStatus = lazy(() => import("./pages/DispatchApplicationStatus"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const UserTypeSelection = lazy(() => import("./pages/UserTypeSelection"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Pilots = lazy(() => import("./pages/Pilots"));
const VendorProfile = lazy(() => import("./pages/VendorProfile").then(m => ({ default: m.VendorProfile })));
const DispatchDashboard = lazy(() => import("./pages/DispatchDashboard"));
const DispatchSelection = lazy(() => import("./pages/DispatchSelection"));
const VendorOrders = lazy(() => import("./pages/VendorOrders"));
const DispatchProfile = lazy(() => import("./pages/DispatchProfile"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const BecomeAVendor = lazy(() => import("./pages/BecomeAVendor"));
const AddressBook = lazy(() => import("./pages/AddressBook"));
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
                  <Suspense fallback={<GenericPageSkeleton />}>
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
                  </Suspense>
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
