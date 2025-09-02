import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDispatchApplications } from '@/hooks/useDispatchApplications';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, CheckCircle, XCircle, Clock, DollarSign, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const AdminDispatchApplications = () => {
  const { applications, loading, updateApplicationStatus } = useDispatchApplications();
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
          <h1 className="text-3xl font-bold">Dispatch Applications</h1>
          <p className="text-muted-foreground">
            Review and manage dispatch applications from users.
          </p>
        </div>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No dispatch applications found.</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {application.dispatch_name}
                        {getStatusIcon(application.status)}
                      </CardTitle>
                      <CardDescription>
                        {application.vehicle_type} • {application.email}
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
                      <p className="text-sm font-medium">Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {application.availability}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone (WhatsApp)</p>
                      <p className="text-sm text-muted-foreground">
                        {application.phone_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Applied</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {application.experience_years && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Experience</p>
                      <p className="text-sm text-muted-foreground">{application.experience_years} years</p>
                    </div>
                  )}

                  {application.coverage_areas && application.coverage_areas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Coverage Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {application.coverage_areas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
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
                          <DialogTitle>{application.dispatch_name}</DialogTitle>
                          <DialogDescription>
                            Complete dispatch application details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm">{application.email}</p>
                            </div>
                            <div>
                              <Label>Phone (WhatsApp)</Label>
                              <p className="text-sm">{application.phone_number}</p>
                            </div>
                            <div>
                              <Label>Vehicle Type</Label>
                              <p className="text-sm">{application.vehicle_type}</p>
                            </div>
                            <div>
                              <Label>Experience</Label>
                              <p className="text-sm">{application.experience_years || 'Not specified'} years</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Availability</Label>
                            <p className="text-sm">{application.availability}</p>
                          </div>

                          {application.license_number && (
                            <div>
                              <Label>License Number</Label>
                              <p className="text-sm">{application.license_number}</p>
                            </div>
                          )}

                          {application.emergency_contact && (
                            <div>
                              <Label>Emergency Contact</Label>
                              <p className="text-sm">{application.emergency_contact}</p>
                            </div>
                          )}
                          
                          {application.coverage_areas && (
                            <div>
                              <Label>Coverage Areas</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {application.coverage_areas.map((area, index) => (
                                  <Badge key={index} variant="outline">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
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
                              <DialogTitle>Approve Dispatch Application</DialogTitle>
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
                              <DialogTitle>Reject Dispatch Application</DialogTitle>
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
                        Give Dispatch Access (Payment Received)
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

export default AdminDispatchApplications;