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
import { Save, CreditCard, Building2, Image, Download } from 'lucide-react';
import { exportOrdersToPDF } from '@/utils/pdfExport';
import { useOrders } from '@/hooks/useOrders';

const AdminSettings = () => {
  const { toast } = useToast();
  const { orders } = useOrders();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    routing_number: '',
    hero_images: [] as string[],
    site_name: 'Pilot',
    site_description: '',
    navbar_logo: '',
    hero_title: '',
    hero_subtitle: '',
    about_hero_title: '',
    about_hero_subtitle: '',
    about_story: '',
    about_mission: '',
    primary_color: '#059669', // Default green color
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
        navbar_logo: settingsMap.navbar_config?.logo || '',
        hero_title: settingsMap.hero_config?.title || '',
        hero_subtitle: settingsMap.hero_config?.subtitle || '',
        about_hero_title: settingsMap.about_config?.hero_title || '',
        about_hero_subtitle: settingsMap.about_config?.hero_subtitle || '',
        about_story: settingsMap.about_config?.story || '',
        about_mission: settingsMap.about_config?.mission || '',
        primary_color: settingsMap.theme_config?.primary_color || '#059669',
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

      // Update navbar config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'navbar_config',
          setting_value: {
            logo: settings.navbar_logo,
          }
        }, { onConflict: 'setting_key' });

      // Update hero config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'hero_config',
          setting_value: {
            title: settings.hero_title,
            subtitle: settings.hero_subtitle,
          }
        }, { onConflict: 'setting_key' });

      // Update about config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'about_config',
          setting_value: {
            hero_title: settings.about_hero_title,
            hero_subtitle: settings.about_hero_subtitle,
            story: settings.about_story,
            mission: settings.about_mission,
          }
        }, { onConflict: 'setting_key' });

      // Update theme config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'theme_config',
          setting_value: {
            primary_color: settings.primary_color,
          }
        }, { onConflict: 'setting_key' });

      // Update CSS variables
      updateThemeColors(settings.primary_color);

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

  const handleLogoUpload = (imageUrl: string) => {
    setSettings(prev => ({
      ...prev,
      navbar_logo: imageUrl
    }));
  };

  const updateThemeColors = (primaryColor: string) => {
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    };

    const [h, s, l] = hexToHsl(primaryColor);
    const hslString = `${h} ${s}% ${l}%`;
    
    document.documentElement.style.setProperty('--primary', hslString);
    document.documentElement.style.setProperty('--ring', hslString);
    document.documentElement.style.setProperty('--chart-1', hslString);
  };

  const handleExportOrders = async () => {
    try {
      setLoading(true);
      await exportOrdersToPDF(orders, {});
      toast({
        title: "Success",
        description: "Orders exported to PDF successfully",
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreDefaultColors = () => {
    setSettings(prev => ({ ...prev, primary_color: '#059669' }));
    updateThemeColors('#059669');
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
          <div className="flex gap-4">
            <Button onClick={handleExportOrders} disabled={loading} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exporting...' : 'Export Orders'}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
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
              <div>
                <Label htmlFor="navbar_logo">Navbar Logo</Label>
                <ImageUpload 
                  onImageUploaded={handleLogoUpload}
                  currentImage={settings.navbar_logo}
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

        {/* Hero Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Hero Section Content
            </CardTitle>
            <CardDescription>
              Customize the main hero section text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={settings.hero_title}
                onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                placeholder="e.g., The People's Store"
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                placeholder="e.g., Discover high-quality products that combine style, functionality..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* About Page Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              About Page Content
            </CardTitle>
            <CardDescription>
              Customize the About page content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="about_hero_title">About Hero Title</Label>
              <Input
                id="about_hero_title"
                value={settings.about_hero_title}
                onChange={(e) => setSettings(prev => ({ ...prev, about_hero_title: e.target.value }))}
                placeholder="e.g., Curating Quality Products"
              />
            </div>
            <div>
              <Label htmlFor="about_hero_subtitle">About Hero Subtitle</Label>
              <Textarea
                id="about_hero_subtitle"
                value={settings.about_hero_subtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, about_hero_subtitle: e.target.value }))}
                placeholder="e.g., We're on a mission to make quality products accessible..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="about_story">About Story</Label>
              <Textarea
                id="about_story"
                value={settings.about_story}
                onChange={(e) => setSettings(prev => ({ ...prev, about_story: e.target.value }))}
                placeholder="Tell your story..."
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="about_mission">About Mission</Label>
              <Textarea
                id="about_mission"
                value={settings.about_mission}
                onChange={(e) => setSettings(prev => ({ ...prev, about_mission: e.target.value }))}
                placeholder="Describe your mission..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Theme Customization
            </CardTitle>
            <CardDescription>
              Customize the site's color scheme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, primary_color: e.target.value }));
                    updateThemeColors(e.target.value);
                  }}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, primary_color: e.target.value }));
                    updateThemeColors(e.target.value);
                  }}
                  placeholder="#059669"
                  className="flex-1"
                />
                <Button onClick={restoreDefaultColors} variant="outline" size="sm">
                  Restore Default
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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