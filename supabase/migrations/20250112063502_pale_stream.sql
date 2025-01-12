/*
  # Add branding and localization support
  
  1. Changes
    - Add locale column to user_profiles table
    - Add branding_config column to user_profiles table
    - Add validation check for branding_config structure
    - Create index for faster queries
  
  2. New Columns
    - locale: Stores user's preferred language
    - branding_config: Stores theme and customization settings
*/

-- Add locale column with default value
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en'
CHECK (locale IN ('en', 'hu'));

-- Add branding_config column with default value
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT jsonb_build_object(
  'appName', 'Subscription Tracker',
  'theme', jsonb_build_object(
    'name', 'Default',
    'colors', jsonb_build_object(
      'primary', '#3B82F6',
      'secondary', '#10B981',
      'accent', '#8B5CF6',
      'background', '#F3F4F6',
      'text', '#1F2937',
      'border', '#E5E7EB'
    ),
    'fonts', jsonb_build_object(
      'body', 'system-ui, -apple-system, sans-serif',
      'heading', 'system-ui, -apple-system, sans-serif'
    )
  )
);

-- Add validation check for branding_config structure
ALTER TABLE user_profiles
ADD CONSTRAINT valid_branding_config_structure
CHECK (
  jsonb_typeof(branding_config) = 'object'
  AND branding_config ? 'appName'
  AND branding_config ? 'theme'
  AND jsonb_typeof(branding_config->'theme') = 'object'
  AND (branding_config->'theme') ? 'colors'
  AND (branding_config->'theme') ? 'fonts'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_branding_config
ON user_profiles USING gin (branding_config);

-- Create index for locale queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_locale
ON user_profiles(locale);

-- Add comment explaining the columns
COMMENT ON COLUMN user_profiles.locale IS 'User''s preferred language (en or hu)';
COMMENT ON COLUMN user_profiles.branding_config IS 'User''s theme and customization settings';