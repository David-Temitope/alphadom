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
import { Save, CreditCard, Building2, Image, Download, Monitor, Smartphone, Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import { exportOrdersToPDF } from '@/utils/pdfExport';
import { useOrders } from '@/hooks/useOrders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeroSlide {
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const { orders } = useOrders();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    routing_number: '',
    hero_slides: [] as HeroSlide[], // New per-slide configuration for mobile
    site_name: 'Alphadom',
    site_description: '',
    navbar_logo: '',
    // Desktop hero text (shown on left side)
    hero_title: 'Welcome To',
    hero_subtitle: 'Hot sales',
    hero_main_text: 'Alphadom,',
    hero_secondary_text: 'The Genesis of Your Online Business.',
    about_hero_title: '',
    about_hero_subtitle: '',
    about_story: '',
    about_mission: '',
    primary_color: '#059669',
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

      // Parse hero_slides
      const rawHeroSlides = settingsMap.hero_slides;
      const parsedHeroSlides: HeroSlide[] = (() => {
        if (Array.isArray(rawHeroSlides)) return rawHeroSlides;
        if (typeof rawHeroSlides === 'string') {
          try {
            const parsed = JSON.parse(rawHeroSlides);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      })();

      // Also try to migrate old hero_images if hero_slides is empty
      if (parsedHeroSlides.length === 0) {
        const rawHeroImages = settingsMap.hero_images;
        const parsedHeroImages: string[] = (() => {
          if (Array.isArray(rawHeroImages)) return rawHeroImages;
          if (typeof rawHeroImages === 'string') {
            try {
              const parsed = JSON.parse(rawHeroImages);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })();
        
        // Convert old images to new slide format
        parsedHeroImages.forEach((img) => {
          if (img) {
            parsedHeroSlides.push({
              image: img,
              tag: 'LIMITED OFFER',
              title: 'Summer Sale',
              subtitle: 'Up to 40% off',
              buttonText: 'Shop Now',
              buttonLink: '/products',
            });
          }
        });
      }

      setSettings({
        bank_name: settingsMap.bank_details?.bank_name || '',
        account_number: settingsMap.bank_details?.account_number || '',
        account_name: settingsMap.bank_details?.account_name || '',
        routing_number: settingsMap.bank_details?.routing_number || '',
        hero_slides: parsedHeroSlides,
        site_name: settingsMap.site_config?.name || 'Alphadom',
        site_description: settingsMap.site_config?.description || '',
        navbar_logo: settingsMap.navbar_config?.logo || '',
        hero_title: settingsMap.hero_config?.title || 'Welcome To',
        hero_subtitle: settingsMap.hero_config?.subtitle || 'Hot sales',
        hero_main_text: settingsMap.hero_config?.main_text || 'Alphadom,',
        hero_secondary_text: settingsMap.hero_config?.secondary_text || 'The Genesis of Your Online Business.',
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

      // Update hero_slides (new format for mobile)
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'hero_slides',
          setting_value: settings.hero_slides as any
        }, { onConflict: 'setting_key' });

      // Also update hero_images for backwards compatibility (just the image URLs)
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'hero_images',
          setting_value: settings.hero_slides.map(s => s.image).filter(Boolean) as any
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

      // Update hero config (desktop static text)
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'hero_config',
          setting_value: {
            title: settings.hero_title,
            subtitle: settings.hero_subtitle,
            main_text: settings.hero_main_text,
            secondary_text: settings.hero_secondary_text,
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

  // Add new hero slide
  const addHeroSlide = () => {
    setSettings(prev => ({
      ...prev,
      hero_slides: [
        ...prev.hero_slides,
        {
          image: '',
          tag: 'NEW ARRIVAL',
          title: 'New Collection',
          subtitle: 'Check out our latest products',
          buttonText: 'Shop Now',
          buttonLink: '/products',
        }
      ]
    }));
  };

  // Update a specific hero slide
  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setSettings(prev => ({
      ...prev,
      hero_slides: prev.hero_slides.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    }));
  };

  // Handle image upload for a specific slide
  const handleSlideImageUpload = (index: number, imageUrl: string) => {
    updateHeroSlide(index, 'image', imageUrl);
  };

  // Remove a hero slide
  const removeHeroSlide = (index: number) => {
    setSettings(prev => ({
      ...prev,
      hero_slides: prev.hero_slides.filter((_, i) => i !== index)
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

        {/* Hero Section - Tabbed for Desktop/Mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Hero Section Configuration
            </CardTitle>
            <CardDescription>
              Configure the hero banner for desktop and mobile views separately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Slides
                </TabsTrigger>
              </TabsList>

              {/* Desktop Hero Configuration */}
              <TabsContent value="desktop" className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Desktop shows static text on the left with image carousel on the right
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hero_title">Hero Title</Label>
                    <Input
                      id="hero_title"
                      value={settings.hero_title}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                      placeholder="e.g., Welcome To"
                    />
                    <p className="text-xs text-muted-foreground mt-1">First line of heading</p>
                  </div>
                  <div>
                    <Label htmlFor="hero_main_text">Hero Main Text (Highlighted)</Label>
                    <Input
                      id="hero_main_text"
                      value={settings.hero_main_text}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_main_text: e.target.value }))}
                      placeholder="e.g., Alphadom,"
                    />
                    <p className="text-xs text-muted-foreground mt-1">This appears with gradient styling</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hero_secondary_text">Hero Secondary Text (Description)</Label>
                  <Textarea
                    id="hero_secondary_text"
                    value={settings.hero_secondary_text}
                    onChange={(e) => setSettings(prev => ({ ...prev, hero_secondary_text: e.target.value }))}
                    placeholder="e.g., The Genesis of Your Online Business."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Description text below the heading</p>
                </div>

                <div>
                  <Label htmlFor="hero_subtitle">Badge/Tag Text</Label>
                  <Input
                    id="hero_subtitle"
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    placeholder="e.g., Hot sales"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Shown as a small badge above the title</p>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs inline-block mb-2">
                    {settings.hero_subtitle || 'Badge Text'}
                  </div>
                  <h3 className="text-xl font-bold">{settings.hero_title || 'Hero Title'}</h3>
                  <h3 className="text-xl font-bold text-primary">{settings.hero_main_text || 'Main Text'}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{settings.hero_secondary_text || 'Description...'}</p>
                </div>
              </TabsContent>

              {/* Mobile Hero Slides Configuration */}
              <TabsContent value="mobile" className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Mobile shows full-screen image slides with overlay text. Each slide has its own content.
                </p>
                
                <Button onClick={addHeroSlide} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Slide
                </Button>

                {settings.hero_slides.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No slides yet. Click "Add New Slide" to create your first hero banner.
                  </div>
                )}

                {settings.hero_slides.map((slide, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Slide {index + 1}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeHeroSlide(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Upload */}
                      <div>
                        <Label>Slide Image</Label>
                        <div className="mt-2">
                          {slide.image ? (
                            <div className="relative">
                              <img 
                                src={slide.image} 
                                alt={`Slide ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => updateHeroSlide(index, 'image', '')}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <ImageUpload 
                              onImageUploaded={(url) => handleSlideImageUpload(index, url)}
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tag/Badge</Label>
                          <Input
                            value={slide.tag}
                            onChange={(e) => updateHeroSlide(index, 'tag', e.target.value)}
                            placeholder="e.g., LIMITED OFFER"
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={slide.title}
                            onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                            placeholder="e.g., Summer Tech Mega Sale"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Subtitle</Label>
                        <Input
                          value={slide.subtitle}
                          onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                          placeholder="e.g., Up to 40% off electronics"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Button Text</Label>
                          <Input
                            value={slide.buttonText}
                            onChange={(e) => updateHeroSlide(index, 'buttonText', e.target.value)}
                            placeholder="e.g., Shop Now"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            Button Link
                          </Label>
                          <Input
                            value={slide.buttonLink}
                            onChange={(e) => updateHeroSlide(index, 'buttonLink', e.target.value)}
                            placeholder="e.g., /products"
                          />
                        </div>
                      </div>

                      {/* Mini Preview */}
                      {slide.image && (
                        <div className="relative rounded-lg overflow-hidden h-24">
                          <img src={slide.image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute bottom-2 left-2 text-white text-xs">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">{slide.tag}</span>
                            <p className="font-bold mt-1">{slide.title}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;