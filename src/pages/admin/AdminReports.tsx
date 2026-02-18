import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Mail, User, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  user_id: string | null;
}

const AdminReports = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRespond = async (messageId: string) => {
    if (!response.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }

    setRespondingTo(messageId);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_response: response,
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response saved successfully",
      });

      setResponse('');
      await fetchMessages();
    } catch (error) {
      console.error('Error responding:', error);
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);
      await fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'responded':
        return <Badge variant="default">Responded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

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
        <div>
          <h1 className="text-3xl font-bold">Reports & Messages</h1>
          <p className="text-muted-foreground">
            Contact form submissions from users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <Send className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responded</p>
                  <p className="text-2xl font-bold">
                    {messages.filter(m => m.status === 'responded').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No messages found.</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={message.status === 'unread' ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-4 w-4" />
                        {message.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {message.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message.status)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.created_at), 'PPp')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {message.subject && (
                    <p className="font-medium">Subject: {message.subject}</p>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">{message.message}</p>

                  {message.admin_response && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Admin Response:</p>
                      <p className="text-sm">{message.admin_response}</p>
                      {message.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded at: {format(new Date(message.responded_at), 'PPp')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {message.status === 'unread' && (
                      <Button variant="outline" size="sm" onClick={() => markAsRead(message.id)}>
                        Mark as Read
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          {message.admin_response ? 'Update Response' : 'Respond'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respond to {message.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Original Message</Label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                              {message.message}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="response">Your Response</Label>
                            <Textarea
                              id="response"
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Type your response..."
                              rows={5}
                              className="mt-1"
                            />
                          </div>
                          <Button 
                            onClick={() => handleRespond(message.id)}
                            disabled={respondingTo === message.id}
                            className="w-full"
                          >
                            {respondingTo === message.id && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Send Response
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

export default AdminReports;
