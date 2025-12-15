
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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import ShopApplicationStatus from "./pages/ShopApplicationStatus";
import DispatchApplicationStatus from "./pages/DispatchApplicationStatus";
import VendorDashboard from "./pages/VendorDashboard";
import UserTypeSelection from "./pages/UserTypeSelection";
import UserSettings from "./pages/UserSettings";
import Pilots from "./pages/Pilots";
import { VendorProfile } from "./pages/VendorProfile";
import DispatchDashboard from "./pages/DispatchDashboard";
import DispatchSelection from "./pages/DispatchSelection";
import VendorOrders from "./pages/VendorOrders";
import DispatchProfile from "./pages/DispatchProfile";

// Create QueryClient outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
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
                <div className="App">
                  <GideonChat />
                  <Toaster />
                  <Sonner />
                  <Routes>
                      {/* Auth Route */}
                      <Route path="/auth" element={<Auth />} />

                      {/* Public Routes */}
                      <Route path="/" element={<Layout><Index /></Layout>} />
                      <Route path="/products" element={<Layout><Products /></Layout>} />
                      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                      <Route path="/cart" element={<Layout><Cart /></Layout>} />
                      <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                      <Route path="/orders" element={<Layout><Orders /></Layout>} />
                      <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                      <Route path="/shop-status" element={<Layout><ShopApplicationStatus /></Layout>} />
                      <Route path="/dispatch-status" element={<Layout><DispatchApplicationStatus /></Layout>} />
                      <Route path="/vendor-dashboard" element={<Layout><VendorDashboard /></Layout>} />
                      <Route path="/vendor-orders" element={<Layout><VendorOrders /></Layout>} />
                      <Route path="/user-types" element={<Layout><UserTypeSelection /></Layout>} />
                      <Route path="/pilots" element={<Layout><Pilots /></Layout>} />
                      <Route path="/pilot/:vendorId" element={<Layout><VendorProfile /></Layout>} />
                      <Route path="/vendor/:vendorId" element={<Layout><VendorProfile /></Layout>} />
                      <Route path="/dispatcher/:dispatchId" element={<Layout><DispatchProfile /></Layout>} />
                      <Route path="/dispatch-dashboard" element={<Layout><DispatchDashboard /></Layout>} />
                      <Route path="/dispatch-selection/:orderId" element={<Layout><DispatchSelection /></Layout>} />
                      <Route path="/settings" element={<Layout><UserSettings /></Layout>} />
                      <Route path="/about" element={<Layout><About /></Layout>} />
                      <Route path="/contact" element={<Layout><Contact /></Layout>} />

                      {/* Admin Routes */}
                      <Route path="/appleisgood/login" element={<AdminLogin />} />
                      <Route path="/appleisgood" element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/products" element={
                        <AdminProtectedRoute allowedRoles={['orders_admin']}>
                          <AdminProducts />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/orders" element={
                        <AdminProtectedRoute allowedRoles={['orders_admin']}>
                          <AdminOrders />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/users" element={
                        <AdminProtectedRoute allowedRoles={['user_admin']}>
                          <AdminUsers />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/settings" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminSettings />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/analytics" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminAnalytics />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/applications" element={
                        <AdminProtectedRoute allowedRoles={['vendor_admin']}>
                          <AdminShopApplications />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/dispatch-applications" element={
                        <AdminProtectedRoute allowedRoles={['dispatch_admin']}>
                          <AdminDispatchApplications />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/vendor-monitoring" element={
                        <AdminProtectedRoute allowedRoles={['vendor_admin']}>
                          <AdminVendorMonitoring />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/dispatch-monitoring" element={
                        <AdminProtectedRoute allowedRoles={['dispatch_admin']}>
                          <AdminDispatchMonitoring />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/admin-management" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminManagement />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/transactions" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminTransactions />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/reports" element={
                        <AdminProtectedRoute allowedRoles={['super_admin']}>
                          <AdminReports />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/adverts" element={
                        <AdminProtectedRoute allowedRoles={['super_admin', 'vendor_admin']}>
                          <AdminAdverts />
                        </AdminProtectedRoute>
                      } />

                      {/* Terms and Privacy Routes */}
                      <Route path="/terms" element={<Layout><Terms /></Layout>} />
                      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />

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
