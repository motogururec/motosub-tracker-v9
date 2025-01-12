/*
  # Add email settings support
  
  1. Changes
    - Add email_settings JSONB column to user_profiles table
    - Add validation check for email_settings structure
    - Create index for faster queries
  
  2. Security
    - Existing RLS policies will cover the new column
*/

-- Add email_settings column with validation
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT jsonb_build_object(
  'smtp_host', '',
  'smtp_port', 587,
  'smtp_user', '',
  'smtp_password', '',
  'smtp_secure', true,
  'from_email', ''
);

-- Add validation check for email_settings structure
ALTER TABLE user_profiles
ADD CONSTRAINT valid_email_settings_structure
CHECK (
  email_settings IS NULL OR (
    jsonb_typeof(email_settings) = 'object'
    AND email_settings ? 'smtp_host'
    AND email_settings ? 'smtp_port'
    AND email_settings ? 'smtp_user'
    AND email_settings ? 'smtp_password'
    AND email_settings ? 'smtp_secure'
    AND email_settings ? 'from_email'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_settings
ON user_profiles USING gin (email_settings);

-- Add comment explaining the column
COMMENT ON COLUMN user_profiles.email_settings IS 'User''s SMTP email server settings for notifications';