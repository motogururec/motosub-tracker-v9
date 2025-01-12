/*
  # Add branding configuration support
  
  1. Changes
    - Add branding JSONB column to user_profiles table
    - Add validation check for branding structure
    - Create index for faster queries
  
  2. New Columns
    - branding: Stores theme and customization settings
*/

-- Add branding column with default value
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT jsonb_build_object(
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

-- Add validation check for branding structure
ALTER TABLE user_profiles
ADD CONSTRAINT valid_branding_structure
CHECK (
  jsonb_typeof(branding) = 'object'
  AND branding ? 'appName'
  AND branding ? 'theme'
  AND jsonb_typeof(branding->'theme') = 'object'
  AND (branding->'theme') ? 'colors'
  AND (branding->'theme') ? 'fonts'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_branding
ON user_profiles USING gin (branding);