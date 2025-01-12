```typescript
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  logo?: {
    url: string;
    width: number;
    height: number;
  };
  background?: {
    url?: string;
    opacity: number;
    blur: number;
  };
}

export interface BrandingConfig {
  appName: string;
  logo?: {
    url: string;
    width: number;
    height: number;
  };
  theme: ThemeConfig;
}
```