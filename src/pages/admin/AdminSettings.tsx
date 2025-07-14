import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Save, CreditCard, Building2, Image } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    routing_number: '',
    hero_images: [] as string[],
    site_name: 'Pilot',
    site_description: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings({
        bank_name: settingsMap.bank_details?.bank_name || '',
        account_number: settingsMap.bank_details?.account_number || '',
        account_name: settingsMap.bank_details?.account_name || '',
        routing_number: settingsMap.bank_details?.routing_number || '',
        hero_images: settingsMap.hero_images || [],
        site_name: settingsMap.site_config?.name || 'Pilot',
        site_description: settingsMap.site_config?.description || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update bank details
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'bank_details',
          setting_value: {
            bank_name: settings.bank_name,
            account_number: settings.account_number,
            account_name: settings.account_name,
            routing_number: settings.routing_number,
          }
        }, { onConflict: 'setting_key' });

      // Update hero images
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'hero_images',
          setting_value: settings.hero_images
        }, { onConflict: 'setting_key' });

      // Update site config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'site_config',
          setting_value: {
            name: settings.site_name,
            description: settings.site_description,
          }
        }, { onConflict: 'setting_key' });

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setSettings(prev => ({
      ...prev,
      hero_images: [...prev.hero_images, imageUrl]
    }));
  };

  const removeImage = (index: number) => {
    setSettings(prev => ({
      ...prev,
      hero_images: prev.hero_images.filter((_, i) => i !== index)
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your store settings and configuration
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>
                Basic site settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Transfer Details
              </CardTitle>
              <CardDescription>
                Account details for bank transfer payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={settings.bank_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={settings.account_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, account_name: e.target.value }))}
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={settings.account_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, account_number: e.target.value }))}
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <Label htmlFor="routing_number">Routing Number</Label>
                <Input
                  id="routing_number"
                  value={settings.routing_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, routing_number: e.target.value }))}
                  placeholder="Enter routing number"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Images Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Hero Images
            </CardTitle>
            <CardDescription>
              Manage images displayed in the hero carousel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload onImageUploaded={handleImageUpload} />
            
            {settings.hero_images.length > 0 && (
              <>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {settings.hero_images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Hero ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;