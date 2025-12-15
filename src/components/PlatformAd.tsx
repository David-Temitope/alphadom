import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  animation_type: string | null;
}

interface PlatformAdProps {
  targetPage: string;
  className?: string;
}

const SESSION_KEY = 'alphadom_ads_dismissed';

export const PlatformAd: React.FC<PlatformAdProps> = ({ targetPage, className = '' }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAd = async () => {
      // Check if ad was already dismissed for this page in this session
      const dismissed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
      if (dismissed[targetPage]) {
        return;
      }

      const { data, error } = await supabase
        .from('platform_ads')
        .select('*')
        .eq('is_active', true)
        .or(`target_page.eq.${targetPage},target_page.is.null`)
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      setAd(data);
      
      // Set animation class based on animation_type
      const animations: Record<string, string> = {
        'slide_left': 'animate-slide-in-left',
        'slide_right': 'animate-slide-in-right',
        'slide_top': 'animate-slide-in-top',
        'slide_bottom': 'animate-slide-in-bottom',
        'zoom': 'animate-zoom-in',
        'fade': 'animate-fade-in'
      };
      setAnimationClass(animations[data.animation_type || 'fade'] || 'animate-fade-in');
      
      // Small delay before showing
      setTimeout(() => setVisible(true), 500);
    };

    fetchAd();
  }, [targetPage]);

  const handleDismiss = () => {
    setVisible(false);
    // Mark as dismissed for this session
    const dismissed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    dismissed[targetPage] = true;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(dismissed));
  };

  const handleClick = () => {
    if (ad?.target_url) {
      window.open(ad.target_url, '_blank');
    } else if (ad?.target_product_id) {
      navigate(`/product/${ad.target_product_id}`);
    } else if (ad?.target_vendor_id) {
      navigate(`/vendor/${ad.target_vendor_id}`);
    } else if (ad?.target_page) {
      navigate(ad.target_page);
    }
  };

  if (!ad || !visible) return null;

  return (
    <Card className={`relative overflow-hidden ${animationClass} ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-background"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-0">
        <div 
          className="cursor-pointer"
          onClick={handleClick}
        >
          {ad.image_url && (
            <div className="relative">
              <img 
                src={ad.image_url} 
                alt={ad.title}
                className="w-full h-48 md:h-64 object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-primary/90">
                Featured
              </Badge>
            </div>
          )}
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{ad.title}</h3>
            {ad.description && (
              <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>
            )}
            
            {ad.cta_text && (
              <Button variant="outline" size="sm" className="gap-1">
                {ad.cta_text}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add to index.css for animations
export const adAnimationStyles = `
@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slide-in-top {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slide-in-bottom {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes zoom-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-slide-in-left { animation: slide-in-left 0.5s ease-out; }
.animate-slide-in-right { animation: slide-in-right 0.5s ease-out; }
.animate-slide-in-top { animation: slide-in-top 0.5s ease-out; }
.animate-slide-in-bottom { animation: slide-in-bottom 0.5s ease-out; }
.animate-zoom-in { animation: zoom-in 0.5s ease-out; }
.animate-fade-in { animation: fade-in 0.5s ease-out; }
`;
