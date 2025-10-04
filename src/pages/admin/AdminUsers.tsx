
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, UserPlus, Mail, Ban, Shield, Loader2, MessageSquare } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers = () => {
  const { users, loading, banUser, unbanUser, updateUserProfile } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (user: any) => {
    setSelectedUser(user);
    setMessageTitle('');
    setMessageContent('');
    setMessageDialogOpen(true);
  };

  const sendUserMessage = async () => {
    if (!messageTitle.trim() || !messageContent.trim() || !selectedUser) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: selectedUser.id,
          title: messageTitle,
          message: messageContent,
          type: 'admin_message',
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedUser.full_name || selectedUser.email}`,
      });
      setMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const toggleAIAccess = async (user: any) => {
    const action = user.ai_access_blocked ? 'unblock' : 'block';
    if (confirm(`Are you sure you want to ${action} AI access for ${user.full_name || user.email}?`)) {
      const result = await updateUserProfile(user.id, { ai_access_blocked: !user.ai_access_blocked });
      if (result.success) {
        toast({
          title: `AI Access ${action}ed`,
          description: `${user.full_name || user.email}'s AI access has been ${action}ed`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} AI access`,
          variant: "destructive",
        });
      }
    }
  };

  const handleManageUser = (user: any) => {
    toast({
      title: "User Management",
      description: `Managing user: ${user.full_name || user.email}`,
    });
  };

  const handleBanUser = async (user: any) => {
    const action = user.is_banned ? 'unban' : 'ban';
    if (confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) {
      const result = user.is_banned ? await unbanUser(user.id) : await banUser(user.id);
      if (result.success) {
        toast({
          title: `User ${action}ned`,
          description: `${user.full_name || user.email} has been ${action}ned`,
          variant: user.is_banned ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} user`,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage customer accounts and permissions
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => !u.is_banned).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => {
                  const created = new Date(u.created_at!);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.created_at!).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_banned ? "destructive" : "default"}>
                        {user.is_banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendMessage(user)}
                          title="Send Message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleAIAccess(user)}
                          title={user.ai_access_blocked ? "Unblock AI Access" : "Block AI Access"}
                        >
                          <Shield className="h-4 w-4" />
                          {user.ai_access_blocked ? "Unblock AI" : "Block AI"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBanUser(user)}
                        >
                          <Ban className="h-4 w-4" />
                          {user.is_banned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to User</DialogTitle>
              <DialogDescription>
                Send a notification to {selectedUser?.full_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="messageTitle">Title</Label>
                <Input
                  id="messageTitle"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="Message title..."
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageContent">Message</Label>
                <Textarea
                  id="messageContent"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  disabled={sending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={sending}>
                  Cancel
                </Button>
                <Button onClick={sendUserMessage} disabled={sending}>
                  {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
