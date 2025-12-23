import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  site_name: string;
  site_description: string;
  hero_images: string[];
  navbar_logo: string;
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
    navbar_logo: "/favicon.png",
    hero_title: "Your Campus",
    hero_subtitle: "Find budget-friendly products from verified vendors. Whether you're looking for textbooks, gadgets, or dorm essentials — we've got you covered! 💰",
    hero_main_text: "Marketplace",
    hero_secondary_text: "Shop Smart, Save Big",
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
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings({
        site_name: settingsMap.site_config?.name || 'Alphadom',
        site_description: settingsMap.site_config?.description || 'The Student Marketplace',
        hero_images: settingsMap.hero_images?.length > 0 ? settingsMap.hero_images : [],
        navbar_logo: settingsMap.navbar_config?.logo || "/favicon.png",
        hero_title: settingsMap.hero_config?.title || "Your Campus",
        hero_subtitle: settingsMap.hero_config?.subtitle || "Find budget-friendly products from verified vendors. Whether you're looking for textbooks, gadgets, or dorm essentials — we've got you covered! 💰",
        hero_main_text: settingsMap.hero_config?.main_text || "Marketplace",
        hero_secondary_text: settingsMap.hero_config?.secondary_text || "Shop Smart, Save Big",
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