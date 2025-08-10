
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/hooks/useTheme";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";

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
  useTheme(); // Initialize theme colors
  console.log('App component rendering');
  
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <AdminProvider>
                <BrowserRouter>
                  <div className="App">
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
                        <AdminProtectedRoute>
                          <AdminProducts />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/orders" element={
                        <AdminProtectedRoute>
                          <AdminOrders />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/users" element={
                        <AdminProtectedRoute>
                          <AdminUsers />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/settings" element={
                        <AdminProtectedRoute>
                          <AdminSettings />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/analytics" element={
                        <AdminProtectedRoute>
                          <AdminAnalytics />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/appleisgood/applications" element={
                        <AdminProtectedRoute>
                          <AdminShopApplications />
                        </AdminProtectedRoute>
                      } />

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
    </ThemeProvider>
  );
};

export default App;
