import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Plus, Edit2, Trash2, Check, ChevronRight, 
  Home, Building, Briefcase, Loader2, ArrowLeft 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAddresses, AddressInput } from '@/hooks/useAddresses';
import { useIsMobile } from '@/hooks/use-mobile';

const addressLabels = [
  { value: 'Home', icon: Home },
  { value: 'Work', icon: Briefcase },
  { value: 'Office', icon: Building },
  { value: 'Other', icon: MapPin },
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const AddressBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressInput>({
    label: 'Home',
    first_name: '',
    last_name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'NG',
    phone: '',
    is_default: false,
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to manage your addresses</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      label: 'Home',
      first_name: '',
      last_name: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'NG',
      phone: '',
      is_default: false,
    });
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingAddress) {
      await updateAddress(editingAddress, formData);
    } else {
      await addAddress(formData);
    }

    setSaving(false);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (address: any) => {
    setFormData({
      label: address.label,
      first_name: address.first_name,
      last_name: address.last_name,
      street: address.street,
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country,
      phone: address.phone,
      is_default: address.is_default,
    });
    setEditingAddress(address.id);
    setIsAddDialogOpen(true);
  };

  const getLabelIcon = (label: string) => {
    const found = addressLabels.find(l => l.value === label);
    return found ? found.icon : MapPin;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">Address Book</span>
              </nav>
              <h1 className="text-xl md:text-2xl font-bold">Address Book</h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "sm" : "default"}>
                  <Plus className="h-4 w-4 mr-1" />
                  {isMobile ? 'Add' : 'Add Address'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label>Label</Label>
                    <Select
                      value={formData.label}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, label: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {addressLabels.map(label => (
                          <SelectItem key={label.value} value={label.value}>
                            <div className="flex items-center gap-2">
                              <label.icon className="h-4 w-4" />
                              {label.value}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Jane"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main Street"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Lagos"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Select
                        value={formData.state || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={formData.postal_code || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="100001"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+234 800 000 0000"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <Label htmlFor="is_default" className="font-normal cursor-pointer">
                      Set as default address
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your delivery addresses for faster checkout
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const LabelIcon = getLabelIcon(address.label);
              
              return (
                <Card 
                  key={address.id} 
                  className={`relative ${address.is_default ? 'border-primary ring-1 ring-primary/20' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <LabelIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{address.label}</span>
                        {address.is_default && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(address)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Address</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this address? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAddress(address.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{address.first_name} {address.last_name}</p>
                      <p className="text-muted-foreground">{address.street}</p>
                      <p className="text-muted-foreground">
                        {address.city}{address.state ? `, ${address.state}` : ''}
                        {address.postal_code ? ` ${address.postal_code}` : ''}
                      </p>
                      <p className="text-muted-foreground">{address.phone}</p>
                    </div>

                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setDefaultAddress(address.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressBook;
