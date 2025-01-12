export interface UserProfile {
  id: string;
  avatar_url: string | null;
  email_settings?: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    smtp_secure: boolean;
    from_email: string;
  };
  preferences: {
    notifications_enabled: boolean;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
  };
  updated_at: string;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
}