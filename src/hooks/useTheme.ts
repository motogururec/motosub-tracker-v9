import { useState, useEffect } from 'react';
import type { ThemeConfig, BrandingConfig } from '../lib/theme/types';
import { themeTemplates } from '../lib/theme/templates';
import { supabase } from '../lib/supabase';

export function useTheme() {
  const [branding, setBranding] = useState<BrandingConfig>({
    appName: 'Subscription Tracker',
    theme: themeTemplates.default,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandingConfig();
  }, []);

  const loadBrandingConfig = async () => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('branding')
        .single();

      if (userProfile?.branding) {
        setBranding(userProfile.branding);
      }
    } catch (error) {
      console.error('Error loading branding config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (newBranding: Partial<BrandingConfig>) => {
    try {
      const updatedBranding = { ...branding, ...newBranding };
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ branding: updatedBranding })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      setBranding(updatedBranding);
      return true;
    } catch (error) {
      console.error('Error updating branding:', error);
      return false;
    }
  };

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty('--color-' + key, value);
    });

    // Apply fonts
    root.style.setProperty('--font-body', theme.fonts.body);
    root.style.setProperty('--font-heading', theme.fonts.heading);

    // Apply background if exists
    if (theme.background?.url) {
      root.style.setProperty('--bg-image', `url(${theme.background.url})`);
      root.style.setProperty('--bg-opacity', theme.background.opacity.toString());
      root.style.setProperty('--bg-blur', `${theme.background.blur}px`);
    }
  };

  useEffect(() => {
    if (!loading) {
      applyTheme(branding.theme);
    }
  }, [branding.theme, loading]);

  return {
    branding,
    updateBranding,
    loading,
    templates: themeTemplates,
  };
}