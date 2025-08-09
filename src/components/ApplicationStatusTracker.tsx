import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, CreditCard, XCircle, AlertCircle } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface ApplicationStatusTrackerProps {
  application: {
    id: string;
    store_name: string;
    status: string;
    created_at: string;
    admin_notes?: string;
    payment_due_date?: string;
  };
}

export const ApplicationStatusTracker = ({ application }: ApplicationStatusTrackerProps) => {
  const { settings } = useAdminSettings();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = [
    { key: 'pending', label: 'Application Submitted', description: 'Your application is under review' },
    { key: 'processing', label: 'Under Review', description: 'Admin is reviewing your application' },
    { key: 'approved', label: 'Approved', description: 'Your application has been approved' },
    { key: 'payment', label: 'Payment Due', description: 'Complete payment to activate your shop' }
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === application.status);

  const handlePaymentClick = () => {
    const paymentDetails = settings.bank_details;
    alert(`Payment Instructions:\n\nBank: ${paymentDetails.bank_name}\nAccount Name: ${paymentDetails.account_name}\nAccount Number: ${paymentDetails.account_number}\nRouting Number: ${paymentDetails.routing_number}\n\nPlease include your application ID: ${application.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(application.status)}
          Application Status: {application.store_name}
        </CardTitle>
        <CardDescription>
          Track the progress of your shop application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-medium">Current Status:</span>
          <Badge className={getStatusColor(application.status)}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-4">
          {statuses.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div
                key={status.key}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {status.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {status.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {application.admin_notes && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">Admin Notes:</h4>
            <p className="text-blue-800 mt-1">{application.admin_notes}</p>
          </div>
        )}

        {application.status === 'payment' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900">Payment Required</h4>
              <p className="text-yellow-800 mt-1">
                Please complete payment to activate your shop.
                {application.payment_due_date && (
                  <span className="block mt-1">
                    Due: {new Date(application.payment_due_date).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <Button onClick={handlePaymentClick} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              View Payment Details
            </Button>
          </div>
        )}

        {application.status === 'rejected' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900">Application Rejected</h4>
            <p className="text-red-800 mt-1">
              Your application was not approved. {application.admin_notes && 'Please see admin notes above for more details.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};