/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `avatar_url` (text, nullable)
      - `preferences` (jsonb, stores user preferences)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{"notifications_enabled": true, "language": "en", "theme": "system", "timezone": "UTC"}',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_preferences CHECK (
    jsonb_typeof(preferences) = 'object'
    AND preferences ? 'notifications_enabled'
    AND preferences ? 'language'
    AND preferences ? 'theme'
    AND preferences ? 'timezone'
  )
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at);