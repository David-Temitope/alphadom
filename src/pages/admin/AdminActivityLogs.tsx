import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { formatDistanceToNow } from 'date-fns';
import { Activity, User } from 'lucide-react';

interface ActivityLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  action_details: any;
  ip_address: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

const AdminActivityLogs = () => {
  const { canManageAdmins } = useAdminRoles();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canManageAdmins()) {
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch associated profiles
      const userIds = logsData?.map(log => log.admin_user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const logsWithProfiles = logsData?.map(log => ({
        ...log,
        profiles: profiles?.find(p => p.id === log.admin_user_id)
      })) || [];

      setLogs(logsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes('delete')) return 'bg-red-100 text-red-800';
    if (actionType.includes('create') || actionType.includes('insert')) return 'bg-green-100 text-green-800';
    if (actionType.includes('update')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
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
        <div>
          <h1 className="text-3xl font-bold">Admin Activity Logs</h1>
          <p className="text-muted-foreground">Monitor all administrative actions</p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading activity logs...</p>
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No activity logs found</p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionBadgeColor(log.action_type)}>
                            {log.action_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {log.profiles?.full_name || log.profiles?.email || 'System'}
                          </span>
                        </div>

                        {log.action_details && (
                          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            <pre className="font-mono text-xs overflow-auto">
                              {JSON.stringify(log.action_details, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.ip_address && (
                          <div className="text-xs text-muted-foreground">
                            IP: {log.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
