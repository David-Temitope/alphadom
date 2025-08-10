import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const AdminShopApplications = () => {
  const { applications, loading, updateApplicationStatus } = useShopApplications();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus, adminNotes);
      setAdminNotes('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Shop Applications</h1>
          <p className="text-muted-foreground">
            Review and manage shop rental applications from users.
          </p>
        </div>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No shop applications found.</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {application.store_name}
                        {getStatusIcon(application.status)}
                      </CardTitle>
                      <CardDescription>
                        {application.product_category} • {application.email}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Price Range</p>
                      <p className="text-sm text-muted-foreground">
                        ${application.price_range_min} - ${application.price_range_max}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground">
                        {application.contact_phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Applied</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {application.business_description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Business Description</p>
                      <p className="text-sm text-muted-foreground">{application.business_description}</p>
                    </div>
                  )}

                  {application.admin_notes && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Admin Notes</p>
                      <p className="text-sm">{application.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{application.store_name}</DialogTitle>
                          <DialogDescription>
                            Complete application details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm">{application.email}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p className="text-sm">{application.contact_phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>Category</Label>
                              <p className="text-sm">{application.product_category}</p>
                            </div>
                            <div>
                              <Label>Price Range</Label>
                              <p className="text-sm">${application.price_range_min} - ${application.price_range_max}</p>
                            </div>
                          </div>
                          
                          {application.business_address && (
                            <div>
                              <Label>Business Address</Label>
                              <p className="text-sm">{application.business_address}</p>
                            </div>
                          )}
                          
                          {application.business_description && (
                            <div>
                              <Label>Business Description</Label>
                              <p className="text-sm">{application.business_description}</p>
                            </div>
                          )}
                          
                          <div>
                            <Label>Bank Details</Label>
                            <pre className="text-xs bg-muted p-2 rounded mt-1">
                              {JSON.stringify(application.bank_details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {application.status === 'pending' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Application</DialogTitle>
                              <DialogDescription>
                                Add any notes for the applicant (optional)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Admin Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Optional notes for the applicant..."
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  onClick={() => handleStatusUpdate(application.id, 'approved')}
                                  disabled={updating}
                                >
                                  {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Approve Application
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Application</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejection
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejection-notes">Rejection Reason</Label>
                                <Textarea
                                  id="rejection-notes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Please explain why this application is being rejected..."
                                  required
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                  disabled={updating || !adminNotes.trim()}
                                >
                                  {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Reject Application
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}

                    {application.status === 'approved' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusUpdate(application.id, 'payment')}
                        disabled={updating}
                      >
                        {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <DollarSign className="h-4 w-4 mr-2" />
                        Mark Payment Received
                      </Button>
                    )}
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

export default AdminShopApplications;