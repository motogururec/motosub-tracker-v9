import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLocalization } from '../hooks/useLocalization';
import { supabase } from '../lib/supabase';
import { Palette, Upload, Save, RefreshCw } from 'lucide-react';
import type { ThemeConfig } from '../lib/theme/types';

export function ThemeCustomizer() {
  const { branding, updateBranding, templates } = useTheme();
  const { t } = useLocalization();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(branding.theme);
  const [logo, setLogo] = useState<File | null>(null);
  const [background, setBackground] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t('errors.fileTooLarge', { max: '2MB' }));
      return;
    }

    setLogo(file);
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('errors.fileTooLarge', { max: '5MB' }));
      return;
    }

    setBackground(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates: any = {
        theme: customTheme,
      };

      if (logo) {
        const logoPath = `logos/${Date.now()}-${logo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(logoPath, logo);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('branding')
            .getPublicUrl(logoPath);

          updates.logo = {
            url: data.publicUrl,
            width: 512,
            height: 512,
          };
        }
      }

      if (background) {
        const bgPath = `backgrounds/${Date.now()}-${background.name}`;
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(bgPath, background);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('branding')
            .getPublicUrl(bgPath);

          updates.theme = {
            ...updates.theme,
            background: {
              url: data.publicUrl,
              opacity: 0.1,
              blur: 0,
            },
          };
        }
      }

      await updateBranding(updates);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('settings.branding.title')}
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedTemplate(key);
              setCustomTheme(template);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Palette className="h-5 w-5" style={{ color: template.colors.primary }} />
              <span className="font-medium">{template.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(template.colors).map(([name, color]) => (
                <div
                  key={name}
                  className="h-6 rounded"
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Color Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('settings.branding.colors')}
          </h3>
          {Object.entries(customTheme.colors).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-4">
              <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {key}
              </label>
              <input
                type="color"
                value={value}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    colors: { ...customTheme.colors, [key]: e.target.value },
                  })
                }
                className="h-8 w-14 rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
          ))}
        </div>

        {/* Logo and Background Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('settings.branding.logo')}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.branding.logo')} (PNG/SVG, max 2MB)
            </label>
            <input
              type="file"
              accept=".png,.svg"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/20 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background (JPG/PNG, max 5MB)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleBackgroundUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/20 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
            />
          </div>

          {customTheme.background?.url && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={(customTheme.background.opacity || 0) * 100}
                onChange={(e) =>
                  setCustomTheme({
                    ...customTheme,
                    background: {
                      ...customTheme.background!,
                      opacity: Number(e.target.value) / 100,
                    },
                  })
                }
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setCustomTheme(templates.default);
            setSelectedTemplate('default');
            setLogo(null);
            setBackground(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.reset')}
        </button>
      </div>
    </div>
  );
}