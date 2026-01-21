import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Settings, Camera, ShoppingBag, Heart, 
  Truck, User, HelpCircle, LogOut, ChevronRight, Loader2,
  Award
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  href?: string;
  action?: () => void;
  count?: number;
}

export const MobileAccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { wishlistItems } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userReviewsCount, setUserReviewsCount] = useState(0);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch user reviews count
  useEffect(() => {
    const fetchReviewsCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('product_ratings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!error && count !== null) {
          setUserReviewsCount(count);
        }
      } catch (error) {
        console.error('Error fetching reviews count:', error);
      }
    };

    fetchReviewsCount();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      
      toast({
        title: "Success",
        description: "Profile picture updated",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    totalOrders: orders.length,
    pointsEarned: Math.floor(orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) / 100),
    reviewsCount: userReviewsCount,
  }), [orders, userReviewsCount]);

  // Calculate membership duration
  const memberSince = useMemo(() => {
    if (!user?.created_at) return 'New Member';
    const date = new Date(user.created_at);
    return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }, [user]);

  // Get membership tier based on points
  const membershipTier = useMemo(() => {
    const points = stats.pointsEarned;
    if (points >= 1000) return { name: 'Gold Member', color: 'text-amber-500' };
    if (points >= 500) return { name: 'Silver Member', color: 'text-slate-400' };
    return { name: 'Bronze Member', color: 'text-amber-700' };
  }, [stats.pointsEarned]);

  // Account activity items
  const accountActivityItems: AccountMenuItem[] = [
    { 
      icon: ShoppingBag, 
      label: 'My Orders', 
      description: 'Track and manage your purchases',
      href: '/orders' 
    },
    { 
      icon: Heart, 
      label: 'Saved Items', 
      description: `${wishlistItems.length} items in your wishlist`,
      href: '/wishlist' 
    },
    { 
      icon: Truck, 
      label: 'Shipping Addresses', 
      description: 'Manage delivery locations',
      href: '/settings' 
    },
  ];

  // General items
  const generalItems: AccountMenuItem[] = [
    { 
      icon: User, 
      label: 'Account Settings',
      href: '/settings' 
    },
    { 
      icon: HelpCircle, 
      label: 'Help Center',
      href: '/contact' 
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4 text-center">Please sign in to access your account</p>
        <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground">
          Sign In
        </Button>
      </div>
    );
  }

  if (profileLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg">Profile</h1>
          <Link to="/settings" className="p-2 -mr-2">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 px-4">
        {/* Avatar with edit button */}
        <div className="relative mb-4">
          <Avatar className="h-28 w-28 border-4 border-primary/20">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Edit button */}
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-primary-foreground" />
            )}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="avatar-upload"
            disabled={uploading}
          />
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
        
        {/* Membership tier */}
        <div className={`flex items-center gap-1.5 mt-1 ${membershipTier.color}`}>
          <Award className="h-4 w-4" />
          <span className="text-sm font-medium">{membershipTier.name}</span>
        </div>
        
        {/* Member since */}
        <p className="text-sm text-muted-foreground mt-1">{memberSince}</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Orders */}
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Orders</p>
          </div>
          
          {/* Reviews */}
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.reviewsCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Reviews</p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-card border border-border rounded-xl p-4 text-center mt-3">
          <p className="text-3xl font-bold text-foreground">{stats.pointsEarned}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Points</p>
        </div>
      </div>

      {/* Account Activity Section */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Account Activity</h3>
        <div className="space-y-2">
          {accountActivityItems.map((item, index) => (
            <Link
              key={index}
              to={item.href || '#'}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      {/* General Section */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">General</h3>
        <div className="space-y-2">
          {generalItems.map((item, index) => (
            <Link
              key={index}
              to={item.href || '#'}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="px-4 mt-8">
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default MobileAccountPage;
