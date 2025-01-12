import type { ThemeConfig } from './types';

export const themeTemplates: Record<string, ThemeConfig> = {
  default: {
    name: 'Default',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
      background: '#F3F4F6',
      text: '#1F2937',
      border: '#E5E7EB',
    },
    fonts: {
      body: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
    },
  },
  modern: {
    name: 'Modern',
    colors: {
      primary: '#6366F1',
      secondary: '#EC4899',
      accent: '#14B8A6',
      background: '#FFFFFF',
      text: '#111827',
      border: '#D1D5DB',
    },
    fonts: {
      body: 'Inter, sans-serif',
      heading: 'Inter, sans-serif',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#A78BFA',
      background: '#111827',
      text: '#F9FAFB',
      border: '#374151',
    },
    fonts: {
      body: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
    },
  },
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#4B5563',
      accent: '#DC2626',
      background: '#FFFFFF',
      text: '#111827',
      border: '#E5E7EB',
    },
    fonts: {
      body: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
    },
  },
  nature: {
    name: 'Nature',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#D97706',
      background: '#ECFDF5',
      text: '#064E3B',
      border: '#D1FAE5',
    },
    fonts: {
      body: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
    },
  },
};