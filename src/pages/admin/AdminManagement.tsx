import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminRoles, AdminRole } from '@/hooks/useAdminRoles';
import { Shield, UserPlus, Trash2, Lock, Ban, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

const AdminManagement = () => {
  const { toast } = useToast();
  const { canManageAdmins } = useAdminRoles();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    role: 'orders_admin' as AdminRole,
  });

  useEffect(() => {
    if (canManageAdmins()) {
      fetchAdmins();
    }
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name || !newAdmin.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Implement email invitation system with confirmation link
      // For now, this is a placeholder
      toast({
        title: 'Feature Coming Soon',
        description: 'Admin invitation system will be implemented with email confirmation',
      });

      setIsAddDialogOpen(false);
      setNewAdmin({ email: '', name: '', role: 'orders_admin' });
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to create admin',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin deleted successfully',
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete admin',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'vendor_admin':
        return 'bg-blue-100 text-blue-800';
      case 'dispatch_admin':
        return 'bg-green-100 text-green-800';
      case 'user_admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'orders_admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    const labels = {
      super_admin: 'Super Admin',
      vendor_admin: 'Vendor Admin',
      dispatch_admin: 'Dispatch Admin',
      user_admin: 'User Admin',
      orders_admin: 'Orders Admin',
    };
    return labels[role] || role;
  };

  if (!canManageAdmins()) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Create a new administrator account. An invitation email will be sent.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newAdmin.role}
                    onValueChange={(value: AdminRole) => setNewAdmin({ ...newAdmin, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders_admin">Orders Admin</SelectItem>
                      <SelectItem value="user_admin">User Admin</SelectItem>
                      <SelectItem value="vendor_admin">Vendor Admin</SelectItem>
                      <SelectItem value="dispatch_admin">Dispatch Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddAdmin} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Admins List */}
        <div className="grid gap-4">
          {admins.map((admin) => (
            <Card key={admin.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {admin.profiles?.full_name || admin.profiles?.email}
                      </h3>
                      <p className="text-sm text-muted-foreground">{admin.profiles?.email}</p>
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {getRoleLabel(admin.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {admin.role !== 'super_admin' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Reset Password
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this admin account. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;
