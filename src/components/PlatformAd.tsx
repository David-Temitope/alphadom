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

      // Query for ads targeting this page, all pages, or null (legacy)
      const { data, error } = await supabase
        .from('platform_ads')
        .select('*')
        .eq('is_active', true)
        .or(`target_page.eq.${targetPage},target_page.eq.all,target_page.is.null`)
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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    } else if (ad?.target_page && ad.target_page !== 'all') {
      navigate(ad.target_page);
    }
  };

  if (!ad || !visible) return null;

  return (
    <div className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 max-w-sm w-full md:w-96 ${className}`}>
      <Card className={`relative overflow-hidden shadow-2xl border-2 ${animationClass}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/90 hover:bg-background rounded-full"
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
                  className="w-full h-32 md:h-40 object-cover"
                  loading="lazy"
                />
                <Badge className="absolute top-2 left-2 bg-primary/90">
                  Featured
                </Badge>
              </div>
            )}
            
            <div className="p-3">
              <h3 className="font-semibold text-base mb-1">{ad.title}</h3>
              {ad.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ad.description}</p>
              )}
              
              {ad.cta_text && (
                <Button variant="default" size="sm" className="gap-1 w-full">
                  {ad.cta_text}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};