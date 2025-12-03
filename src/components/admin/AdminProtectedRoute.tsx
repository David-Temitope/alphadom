
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AdminRole = 'super_admin' | 'vendor_admin' | 'dispatch_admin' | 'user_admin' | 'orders_admin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { admin, isLoading } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/appleisgood/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check if user has access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = admin.role === 'super_admin' || allowedRoles.includes(admin.role);
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this page. This area is restricted to {allowedRoles.map(r => r.replace('_', ' ')).join(', ')} only.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
