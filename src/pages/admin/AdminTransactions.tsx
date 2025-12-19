import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Search, DollarSign, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  payment_method: string | null;
  reference: string | null;
  description: string | null;
  created_at: string;
  vendor_id: string | null;
  user_id: string | null;
  order_id: string | null;
  metadata: any;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.transaction_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Alphadom Platform Transactions', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 30);
    doc.text(`Total Amount: ₦${totalAmount.toLocaleString()}`, 20, 36);
    
    // Table header
    let y = 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 20, y);
    doc.text('Type', 50, y);
    doc.text('Amount', 100, y);
    doc.text('Status', 130, y);
    doc.text('Reference', 160, y);
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    y += 10;
    
    filteredTransactions.forEach((tx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(format(new Date(tx.created_at), 'PP'), 20, y);
      doc.text(tx.transaction_type.replace('_', ' '), 50, y);
      doc.text(`₦${Number(tx.amount).toLocaleString()}`, 100, y);
      doc.text(tx.status || 'completed', 130, y);
      doc.text(tx.reference?.substring(0, 15) || '-', 160, y);
      y += 8;
    });
    
    doc.save('alphadom-transactions.pdf');
    
    toast({
      title: "Success",
      description: "Transactions exported to PDF",
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'default';
      case 'order_payment':
        return 'secondary';
      case 'commission':
        return 'outline';
      default:
        return 'secondary';
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              All platform financial transactions
            </p>
          </div>
          <Button onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform Commission</p>
                  <p className="text-2xl font-bold">₦{filteredTransactions
                    .filter(tx => tx.transaction_type === 'order_payment' && tx.metadata?.platform_commission)
                    .reduce((sum, tx) => sum + Number(tx.metadata?.platform_commission || 0), 0)
                    .toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {transactions.filter(tx => 
                      new Date(tx.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="order_payment">Order Payment</SelectItem>
              <SelectItem value="commission">Commission</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found.</p>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx) => {
                  const meta = tx.metadata || {};
                  const hasSplit = meta.split_payment === true;
                  
                  return (
                    <div key={tx.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-muted p-2 rounded-lg">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.description || tx.transaction_type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(tx.created_at), 'PPp')}
                            </p>
                            {tx.reference && (
                              <p className="text-xs text-muted-foreground">Ref: {tx.reference}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₦{Number(tx.amount).toLocaleString()}</p>
                          <Badge variant={getTypeBadgeVariant(tx.transaction_type)}>
                            {tx.transaction_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Commission Breakdown for order payments */}
                      {tx.transaction_type === 'order_payment' && (() => {
                        // Calculate commission based on subscription plan
                        const subscriptionPlan = meta.subscription_plan || 'free';
                        let commissionRate = 15; // default free
                        if (subscriptionPlan === 'economy') commissionRate = 9;
                        if (subscriptionPlan === 'first_class') commissionRate = 5;
                        
                        const vendorPercentage = 100 - commissionRate;
                        const platformCommission = Number(tx.amount) * (commissionRate / 100);
                        const vendorPayout = Number(tx.amount) * (vendorPercentage / 100);
                        
                        return (
                          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Subscription Plan:</span>
                              <Badge variant="outline" className="capitalize">
                                {subscriptionPlan}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Commission Rate:</span>
                              <span className="font-medium">{commissionRate}%</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-green-600">
                              <span>Platform Revenue ({commissionRate}%):</span>
                              <span className="font-semibold">₦{platformCommission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                              <span>Vendor Payout ({vendorPercentage}%):</span>
                              <span className="font-semibold">₦{vendorPayout.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Subscription payments - 100% platform revenue */}
                      {tx.transaction_type === 'subscription' && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="flex justify-between text-green-600">
                            <span>Platform Revenue (100%):</span>
                            <span className="font-semibold">₦{Number(tx.amount).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
