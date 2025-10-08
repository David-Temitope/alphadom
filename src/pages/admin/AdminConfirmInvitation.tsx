import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import bcrypt from 'bcryptjs';

const AdminConfirmInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    confirmInvitation();
  }, [token]);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segments = [];
    for (let i = 0; i < 3; i++) {
      let segment = '';
      for (let j = 0; j < 5; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    return `ADM-${segments.join('-')}`;
  };

  const confirmInvitation = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    try {
      // Check if invitation exists and is valid
      const { data: invitation, error: fetchError } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('invitation_token', token)
        .maybeSingle();

      if (fetchError || !invitation) {
        setStatus('error');
        setMessage('Invalid or expired invitation');
        return;
      }

      // Check if already accepted
      if (invitation.accepted_at) {
        setStatus('error');
        setMessage('This invitation has already been used');
        return;
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        setStatus('error');
        setMessage('This invitation has expired');
        return;
      }

      // Generate secure password
      const password = generateSecurePassword();
      const passwordHash = await bcrypt.hash(password, 10);

      // Create or get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', invitation.email)
        .maybeSingle();

      let userId = profile?.id;

      if (!userId) {
        // Create a new profile entry
        const { data: newProfile, error: createProfileError } = await supabase.auth.admin.createUser({
          email: invitation.email,
          email_confirm: true,
          user_metadata: { full_name: invitation.name }
        });

        if (createProfileError) throw createProfileError;
        userId = newProfile.user?.id;
      }

      // Create admin role
      const { error: roleError } = await supabase
        .from('admin_roles')
        .insert({
          user_id: userId,
          role: invitation.role,
          password_hash: passwordHash,
          is_active: true,
          created_by: invitation.created_by
        });

      if (roleError) throw roleError;

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('admin_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Send password email
      await supabase.functions.invoke('send-admin-password', {
        body: {
          email: invitation.email,
          name: invitation.name,
          password
        }
      });

      setStatus('success');
      setMessage('Admin account confirmed! Check your email for login credentials.');
      
      toast({
        title: 'Success',
        description: 'Admin account created successfully. Check your email for login credentials.',
      });

      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);

    } catch (error: any) {
      console.error('Error confirming invitation:', error);
      setStatus('error');
      setMessage('Failed to confirm invitation. Please try again or contact support.');
      
      toast({
        title: 'Error',
        description: 'Failed to confirm invitation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirming your invitation...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center">{message}</p>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login page...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConfirmInvitation;
