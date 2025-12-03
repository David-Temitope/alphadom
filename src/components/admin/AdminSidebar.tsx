
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  Truck,
  Store,
  UserCog
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  onNavigate?: () => void;
}

type AdminRole = 'super_admin' | 'vendor_admin' | 'dispatch_admin' | 'user_admin' | 'orders_admin';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: AdminRole[];
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/appleisgood', icon: LayoutDashboard, allowedRoles: ['super_admin', 'vendor_admin', 'dispatch_admin', 'user_admin', 'orders_admin'] },
  { name: 'Products', href: '/appleisgood/products', icon: Package, allowedRoles: ['super_admin', 'orders_admin'] },
  { name: 'Orders', href: '/appleisgood/orders', icon: ShoppingCart, allowedRoles: ['super_admin', 'orders_admin'] },
  { name: 'Shop Applications', href: '/appleisgood/applications', icon: Store, allowedRoles: ['super_admin', 'vendor_admin'] },
  { name: 'Dispatch Applications', href: '/appleisgood/dispatch-applications', icon: Truck, allowedRoles: ['super_admin', 'dispatch_admin'] },
  { name: 'Vendor Monitoring', href: '/appleisgood/vendor-monitoring', icon: BarChart3, allowedRoles: ['super_admin', 'vendor_admin'] },
  { name: 'Dispatch Monitoring', href: '/appleisgood/dispatch-monitoring', icon: Truck, allowedRoles: ['super_admin', 'dispatch_admin'] },
  { name: 'Users', href: '/appleisgood/users', icon: Users, allowedRoles: ['super_admin', 'user_admin'] },
  { name: 'Admin Management', href: '/appleisgood/admin-management', icon: UserCog, allowedRoles: ['super_admin'] },
  { name: 'Analytics', href: '/appleisgood/analytics', icon: BarChart3, allowedRoles: ['super_admin'] },
  { name: 'Settings', href: '/appleisgood/settings', icon: Settings, allowedRoles: ['super_admin'] },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const location = useLocation();
  const { logout, admin } = useAdmin();

  // Filter sidebar items based on user's role
  const filteredItems = sidebarItems.filter(item => {
    if (!admin) return false;
    return admin.role === 'super_admin' || item.allowedRoles.includes(admin.role);
  });

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Alphadom</h2>
            <p className="text-sm text-muted-foreground capitalize">{admin?.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};
