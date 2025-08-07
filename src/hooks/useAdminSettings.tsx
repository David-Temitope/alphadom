import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  site_name: string;
  site_description: string;
  hero_images: string[];
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
    routing_number: string;
  };
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: 'Pilot',
    site_description: 'Premium Quality You Can Trust',
    hero_images: [
      "/lovable-uploads/ac61d3f1-910e-4684-9170-ee2679c7ce3b.png",
      "/lovable-uploads/a8b891ca-80d3-40e7-9e2a-aacfbe0fc861.png",
      "/lovable-uploads/b58904b8-8d81-4393-a765-af4fc0eea4f8.png"
    ],
    bank_details: {
      bank_name: '',
      account_number: '',
      account_name: '',
      routing_number: ''
    }
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
        site_name: settingsMap.site_config?.name || 'Pilot',
        site_description: settingsMap.site_config?.description || 'Premium Quality You Can Trust',
        hero_images: settingsMap.hero_images?.length > 0 ? settingsMap.hero_images : [
          "/lovable-uploads/ac61d3f1-910e-4684-9170-ee2679c7ce3b.png",
          "/lovable-uploads/a8b891ca-80d3-40e7-9e2a-aacfbe0fc861.png",
          "/lovable-uploads/b58904b8-8d81-4393-a765-af4fc0eea4f8.png"
        ],
        bank_details: {
          bank_name: settingsMap.bank_details?.bank_name || '',
          account_number: settingsMap.bank_details?.account_number || '',
          account_name: settingsMap.bank_details?.account_name || '',
          routing_number: settingsMap.bank_details?.routing_number || ''
        }
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