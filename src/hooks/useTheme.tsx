import { useEffect } from 'react';
import { useAdminSettings } from './useAdminSettings';

export const useTheme = () => {
  const { settings } = useAdminSettings();

  useEffect(() => {
    if (settings.primary_color) {
      updateThemeColors(settings.primary_color);
    }
  }, [settings.primary_color]);

  const updateThemeColors = (primaryColor: string) => {
    const hexToHsl = (hex: string) => {
      // Remove # if present
      hex = hex.replace('#', '');
      
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

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
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary', hslString);
    document.documentElement.style.setProperty('--ring', hslString);
    document.documentElement.style.setProperty('--chart-1', hslString);
    
    // Update dark mode variables
    const darkL = Math.min(l + 10, 70); // Lighter for dark mode
    const darkHslString = `${h} ${Math.max(s - 5, 60)}% ${darkL}%`;
    document.documentElement.style.setProperty('--primary-dark', darkHslString);
  };

  return { updateThemeColors };
};