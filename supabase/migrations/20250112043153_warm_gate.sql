/*
  # Add Subscription Categories Management
  
  1. New Tables
    - `subscription_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `parent_id` (uuid, self-referencing foreign key)
      - `is_public` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users, nullable for system categories)

  2. Security
    - Enable RLS on `subscription_categories` table
    - Add policies for CRUD operations
    - Allow viewing of system-defined categories (where user_id is null)
*/

-- Create subscription_categories table
CREATE TABLE IF NOT EXISTS subscription_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name ~ '^[a-zA-Z0-9\-_]+$'),
  description text,
  parent_id uuid REFERENCES subscription_categories(id),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Add unique constraint for category name per user
CREATE UNIQUE INDEX idx_unique_category_name_per_user 
ON subscription_categories (name, (CASE WHEN user_id IS NULL THEN '00000000-0000-0000-0000-000000000000'::uuid ELSE user_id END));

-- Enable RLS
ALTER TABLE subscription_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own and system categories"
  ON subscription_categories
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR user_id IS NULL 
    OR is_public = true
  );

CREATE POLICY "Users can create their own categories"
  ON subscription_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON subscription_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON subscription_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_subscription_categories_user ON subscription_categories(user_id);
CREATE INDEX idx_subscription_categories_parent ON subscription_categories(parent_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_categories_updated_at
  BEFORE UPDATE ON subscription_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default system categories (no user_id for system-defined categories)
INSERT INTO subscription_categories (name, description, is_public, user_id)
VALUES 
  ('streaming', 'Streaming service subscriptions', true, NULL),
  ('software', 'Software and application subscriptions', true, NULL),
  ('gaming', 'Gaming service subscriptions', true, NULL),
  ('other', 'Other subscriptions', true, NULL)
ON CONFLICT DO NOTHING;