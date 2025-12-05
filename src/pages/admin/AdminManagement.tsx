
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, Trash2, UserPlus, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AdminRole = 'super_admin' | 'vendor_admin' | 'dispatch_admin' | 'user_admin' | 'orders_admin';

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  vendor_admin: 'Vendor Admin',
  dispatch_admin: 'Dispatch Admin',
  user_admin: 'User Admin',
  orders_admin: 'Orders Admin',
};

const roleBadgeColors: Record<AdminRole, string> = {
  super_admin: 'bg-primary text-primary-foreground',
  vendor_admin: 'bg-blue-500 text-white',
  dispatch_admin: 'bg-orange-500 text-white',
  user_admin: 'bg-green-500 text-white',
  orders_admin: 'bg-purple-500 text-white',
};

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('user_admin');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    try {
      const { data: adminRoles, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each admin
      const adminsWithProfiles = await Promise.all(
        (adminRoles || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', admin.user_id)
            .maybeSingle();

          return {
            ...admin,
            profile: profile || { full_name: null, email: 'Unknown' },
          };
        })
      );

      setAdmins(adminsWithProfiles);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      setAdmins(admins.filter((a) => a.id !== adminId));
      toast({
        title: 'Admin Removed',
        description: 'Admin access has been revoked successfully',
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove admin access',
        variant: 'destructive',
      });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', newAdminEmail.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: 'User Not Found',
          description: 'No user found with this email address. The user must have an account first.',
          variant: 'destructive',
        });
        setIsAdding(false);
        return;
      }

      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (existingRole) {
        toast({
          title: 'Already Admin',
          description: 'This user already has an admin role',
          variant: 'destructive',
        });
        setIsAdding(false);
        return;
      }

      // Add admin role
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert({
          user_id: profile.id,
          role: newAdminRole,
          is_active: true,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Admin Added',
        description: `${profile.full_name || profile.email} has been granted ${roleLabels[newAdminRole]} access`,
      });

      setAddDialogOpen(false);
      setNewAdminEmail('');
      setNewAdminRole('user_admin');
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to add admin',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRole = async (adminId: string, newRole: AdminRole) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .update({ role: newRole })
        .eq('id', adminId);

      if (error) throw error;

      setAdmins(admins.map((a) => (a.id === adminId ? { ...a, role: newRole } : a)));
      toast({
        title: 'Role Updated',
        description: 'Admin role has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin role',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-8 w-8" />
              Admin Management
            </h1>
            <p className="text-muted-foreground">Manage admin users and their roles</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
                  Grant admin access to an existing user by their email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Admin Role</Label>
                  <Select value={newAdminRole} onValueChange={(v) => setNewAdminRole(v as AdminRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor_admin">Vendor Admin</SelectItem>
                      <SelectItem value="dispatch_admin">Dispatch Admin</SelectItem>
                      <SelectItem value="user_admin">User Admin</SelectItem>
                      <SelectItem value="orders_admin">Orders Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Admin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(roleLabels).map(([role, label]) => {
            const count = admins.filter((a) => a.role === role && a.is_active).length;
            return (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Administrators</CardTitle>
            <CardDescription>View and manage all admin users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {admin.profile?.full_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{admin.profile?.email || 'Unknown'}</TableCell>
                    <TableCell>
                      <Select
                        value={admin.role}
                        onValueChange={(v) => handleUpdateRole(admin.id, v as AdminRole)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <Badge className={roleBadgeColors[admin.role]}>
                            {roleLabels[admin.role]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendor_admin">Vendor Admin</SelectItem>
                          <SelectItem value="dispatch_admin">Dispatch Admin</SelectItem>
                          <SelectItem value="user_admin">User Admin</SelectItem>
                          <SelectItem value="orders_admin">Orders Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No administrators found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;
