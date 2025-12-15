import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  target_url: string | null;
  target_page: string | null;
  target_product_id: string | null;
  target_vendor_id: string | null;
  is_active: boolean;
  animation_type: string | null;
  priority: number;
  created_at: string;
}

const ANIMATION_TYPES = [
  { value: 'fade', label: 'Fade In' },
  { value: 'slide_left', label: 'Slide from Left' },
  { value: 'slide_right', label: 'Slide from Right' },
  { value: 'slide_top', label: 'Slide from Top' },
  { value: 'slide_bottom', label: 'Slide from Bottom' },
  { value: 'zoom', label: 'Zoom In' },
];

const TARGET_PAGES = [
  { value: '', label: 'All Pages' },
  { value: 'home', label: 'Homepage' },
  { value: 'products', label: 'Products Page' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' },
];

const AdminAdverts = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_ads')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching ads', variant: 'destructive' });
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingAd?.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingAd.id) {
        // Update existing
        const { error } = await supabase
          .from('platform_ads')
          .update({
            title: editingAd.title,
            description: editingAd.description,
            image_url: editingAd.image_url,
            cta_text: editingAd.cta_text,
            target_url: editingAd.target_url,
            target_page: editingAd.target_page || null,
            target_product_id: editingAd.target_product_id || null,
            target_vendor_id: editingAd.target_vendor_id || null,
            is_active: editingAd.is_active,
            animation_type: editingAd.animation_type,
            priority: editingAd.priority || 0,
          })
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: 'Ad updated successfully' });
      } else {
        // Create new
        const { error } = await supabase
          .from('platform_ads')
          .insert({
            title: editingAd.title,
            description: editingAd.description,
            image_url: editingAd.image_url,
            cta_text: editingAd.cta_text,
            target_url: editingAd.target_url,
            target_page: editingAd.target_page || null,
            target_product_id: editingAd.target_product_id || null,
            target_vendor_id: editingAd.target_vendor_id || null,
            is_active: editingAd.is_active ?? true,
            animation_type: editingAd.animation_type || 'fade',
            priority: editingAd.priority || 0,
          });

        if (error) throw error;
        toast({ title: 'Ad created successfully' });
      }

      setIsDialogOpen(false);
      setEditingAd(null);
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({ title: 'Failed to save ad', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    const { error } = await supabase
      .from('platform_ads')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Failed to delete ad', variant: 'destructive' });
    } else {
      toast({ title: 'Ad deleted' });
      fetchAds();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('platform_ads')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast({ title: 'Failed to update ad', variant: 'destructive' });
    } else {
      fetchAds();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Adverts</h1>
            <p className="text-muted-foreground">
              Manage featured content and promotions for paid vendors.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAd({})}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAd?.id ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
                <DialogDescription>
                  Create featured content to promote vendors and products.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editingAd?.title || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                    placeholder="Ad title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingAd?.description || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                    placeholder="Short description"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Ad Image</Label>
                  {editingAd?.image_url ? (
                    <div className="relative mt-2">
                      <img src={editingAd.image_url} alt="Ad" className="w-full h-40 object-cover rounded" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setEditingAd({ ...editingAd, image_url: '' })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <ImageUpload onImageUploaded={(url) => setEditingAd({ ...editingAd, image_url: url })} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta">CTA Button Text</Label>
                    <Input
                      id="cta"
                      value={editingAd?.cta_text || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, cta_text: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_url">Target URL (External)</Label>
                    <Input
                      id="target_url"
                      value={editingAd?.target_url || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, target_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_page">Display On Page</Label>
                    <Select 
                      value={editingAd?.target_page || ''} 
                      onValueChange={(v) => setEditingAd({ ...editingAd, target_page: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_PAGES.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="animation">Animation Type</Label>
                    <Select 
                      value={editingAd?.animation_type || 'fade'} 
                      onValueChange={(v) => setEditingAd({ ...editingAd, animation_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMATION_TYPES.map(a => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority (Higher = First)</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={editingAd?.priority || 0}
                      onChange={(e) => setEditingAd({ ...editingAd, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={editingAd?.is_active ?? true}
                      onCheckedChange={(checked) => setEditingAd({ ...editingAd, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingAd?.id ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ads List */}
        <div className="grid gap-4">
          {ads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No ads created yet.</p>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {ad.target_page && (
                          <Badge variant="outline">{ad.target_page}</Badge>
                        )}
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground mb-2">{ad.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Priority: {ad.priority} • Animation: {ad.animation_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleActive(ad.id, ad.is_active)}
                      >
                        <Eye className={`h-4 w-4 ${ad.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingAd(ad);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

export default AdminAdverts;
