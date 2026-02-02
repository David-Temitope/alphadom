import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Individual hero slide configuration (for mobile)
export interface HeroSlide {
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface AdminSettings {
  site_name: string;
  site_description: string;
  hero_images: string[];
  hero_slides: HeroSlide[]; // New: per-slide configuration for mobile
  navbar_logo: string;
  // Desktop hero config (static text shown on left side)
  hero_title: string;
  hero_subtitle: string;
  hero_main_text: string;
  hero_secondary_text: string;
  about_hero_title: string;
  about_hero_subtitle: string;
  about_story: string;
  about_mission: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
    routing_number: string;
  };
  primary_color: string;
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: 'Alphadom',
    site_description: 'The Student Marketplace',
    hero_images: [],
    hero_slides: [],
    navbar_logo: "/favicon.png",
    hero_title: "Welcome To",
    hero_subtitle: "Hot sales",
    hero_main_text: "Alphadom,",
    hero_secondary_text: "The Genesis of Your Online Business.",
    about_hero_title: "Curating Quality Products",
    about_hero_subtitle: "We're on a mission to make quality products accessible, affordable, and beautiful for everyone.",
    about_story: "",
    about_mission: "",
    bank_details: {
      bank_name: '',
      account_number: '',
      account_name: '',
      routing_number: ''
    },
    primary_color: '#059669'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Fetch hero_slides specifically to ensure RLS allows public access
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['site_config', 'navbar_config', 'hero_config', 'hero_images', 'hero_slides', 'about_config', 'bank_details', 'theme_config']);

      if (error) {
        console.error('Error fetching admin settings:', error);
        throw error;
      }

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      // hero_images can be stored as a JSON array or a JSON-stringified array
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

      // Parse hero_slides for mobile (per-image configuration)
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

      setSettings({
        site_name: settingsMap.site_config?.name || 'Alphadom',
        site_description: settingsMap.site_config?.description || 'The Student Marketplace',
        hero_images: parsedHeroImages.filter((u) => typeof u === 'string' && u.length > 0),
        hero_slides: parsedHeroSlides,
        navbar_logo: settingsMap.navbar_config?.logo || "/favicon.png",
        hero_title: settingsMap.hero_config?.title || "Welcome To",
        hero_subtitle: settingsMap.hero_config?.subtitle || "Hot sales",
        hero_main_text: settingsMap.hero_config?.main_text || "Alphadom,",
        hero_secondary_text: settingsMap.hero_config?.secondary_text || "The Genesis of Your Online Business.",
        about_hero_title: settingsMap.about_config?.hero_title || "Curating Quality Products",
        about_hero_subtitle: settingsMap.about_config?.hero_subtitle || "We're on a mission to make quality products accessible, affordable, and beautiful for everyone.",
        about_story: settingsMap.about_config?.story || "",
        about_mission: settingsMap.about_config?.mission || "",
        bank_details: {
          bank_name: settingsMap.bank_details?.bank_name || '',
          account_number: settingsMap.bank_details?.account_number || '',
          account_name: settingsMap.bank_details?.account_name || '',
          routing_number: settingsMap.bank_details?.routing_number || ''
        },
        primary_color: settingsMap.theme_config?.primary_color || '#059669'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    refreshSettings: fetchSettings
  };
};