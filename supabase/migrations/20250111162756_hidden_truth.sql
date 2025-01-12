/*
  # Create subscriptions management schema

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `service_name` (text)
      - `cost` (decimal)
      - `billing_cycle` (text)
      - `billing_date` (date)
      - `category` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)
      - `next_billing_date` (date)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for CRUD operations
*/

-- Create enum types for categories and billing cycles
CREATE TYPE subscription_category AS ENUM ('streaming', 'software', 'gaming', 'other');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  service_name text NOT NULL,
  cost decimal(10,2) NOT NULL CHECK (cost >= 0),
  billing_cycle billing_cycle NOT NULL,
  billing_date date NOT NULL,
  category subscription_category NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now(),
  next_billing_date date NOT NULL,
  CONSTRAINT valid_dates CHECK (billing_date <= next_billing_date)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_subscriptions ON subscriptions(user_id);
CREATE INDEX idx_next_billing_date ON subscriptions(next_billing_date);