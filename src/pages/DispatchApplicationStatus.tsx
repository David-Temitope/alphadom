import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDispatchApplications } from '@/hooks/useDispatchApplications';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, XCircle, DollarSign, Mail, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

const DispatchApplicationStatus = () => {
  const { userApplication, refreshUserApplication } = useDispatchApplications();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    refreshUserApplication();
  }, []);

  useEffect(() => {
    if (userApplication?.payment_countdown_expires_at) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiryTime = new Date(userApplication.payment_countdown_expires_at!).getTime();
        const distance = expiryTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [userApplication?.payment_countdown_expires_at]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to view your application status.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No dispatch application found.</p>
            <Button asChild className="mt-4">
              <Link to="/">Apply as Dispatcher</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'payment': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your dispatch application is under review. We will notify you once a decision has been made.';
      case 'approved':
        return 'Congratulations! Your dispatch application has been approved. Please check your email for payment instructions.';
      case 'rejected':
        return 'Unfortunately, your dispatch application has been rejected. Please see the admin notes below for more details.';
      case 'payment':
        return 'Payment confirmed! Your dispatch account is being set up. You will receive access to your dashboard shortly.';
      default:
        return 'Application status unknown.';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dispatch Application Status</h1>
          <p className="text-muted-foreground">Track the progress of your dispatch application</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {userApplication.dispatch_name}
                  {getStatusIcon(userApplication.status)}
                </CardTitle>
                <CardDescription>
                  Application submitted on {new Date(userApplication.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(userApplication.status)}>
                {userApplication.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{getStatusMessage(userApplication.status)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2">{userApplication.dispatch_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="ml-2">{userApplication.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="ml-2">{userApplication.experience_years} years</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Application Submitted</span>
                  </div>
                  <div className={`flex items-center gap-2 ${userApplication.status !== 'pending' ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {userApplication.status !== 'pending' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <span>Application Reviewed</span>
                  </div>
                  {userApplication.status === 'approved' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Awaiting Payment</span>
                    </div>
                  )}
                  {userApplication.status === 'payment' && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Payment Received</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {userApplication.admin_notes && (
              <div>
                <h3 className="font-medium mb-2">Admin Notes</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{userApplication.admin_notes}</p>
                </div>
              </div>
            )}

            {userApplication.status === 'approved' && userApplication.payment_countdown_expires_at && (
              <div className="p-4 border border-primary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Payment Required</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Please check your email for payment instructions. You have a limited time to complete the payment.
                </p>
                
                {timeLeft && timeLeft !== 'Expired' && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Time remaining: {timeLeft}</span>
                  </div>
                )}
                
                {timeLeft === 'Expired' && (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Payment window has expired</span>
                  </div>
                )}
              </div>
            )}

            {userApplication.status === 'payment' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Account Setup Complete</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your dispatch account is being prepared. You will receive access to your dashboard shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispatchApplicationStatus;
