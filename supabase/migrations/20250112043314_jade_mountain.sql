/*
  # Enhanced Category Management System
  
  1. New Tables
    - `category_attributes`
      - Custom attributes for categories
    - `category_orders`
      - Manage display order of categories
    - `category_history`
      - Track category changes

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Add new columns to subscription_categories
ALTER TABLE subscription_categories 
ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create category_attributes table
CREATE TABLE IF NOT EXISTS category_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES subscription_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'date')),
  default_value text,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  UNIQUE (category_id, name)
);

-- Create category_history table
CREATE TABLE IF NOT EXISTS category_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES subscription_categories(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'move')),
  changes jsonb NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_history ENABLE ROW LEVEL SECURITY;

-- Create policies for category_attributes
CREATE POLICY "Users can view category attributes"
  ON category_attributes FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM subscription_categories sc 
      WHERE sc.id = category_id 
      AND (sc.user_id IS NULL OR sc.is_public = true)
    )
  );

CREATE POLICY "Users can manage their own category attributes"
  ON category_attributes FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for category_history
CREATE POLICY "Users can view category history"
  ON category_history FOR SELECT TO authenticated
  USING (performed_by = auth.uid());

-- Create function to maintain category hierarchy
CREATE OR REPLACE FUNCTION check_category_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent circular references
  IF EXISTS (
    WITH RECURSIVE category_tree AS (
      SELECT id, parent_id FROM subscription_categories WHERE id = NEW.parent_id
      UNION ALL
      SELECT c.id, c.parent_id 
      FROM subscription_categories c
      INNER JOIN category_tree ct ON ct.parent_id = c.id
    )
    SELECT 1 FROM category_tree WHERE id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Circular reference detected in category hierarchy';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hierarchy check
CREATE TRIGGER check_category_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON subscription_categories
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION check_category_hierarchy();

-- Create function to log category changes
CREATE OR REPLACE FUNCTION log_category_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO category_history (category_id, action, changes, performed_by)
    VALUES (NEW.id, 'create', to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO category_history (category_id, action, changes, performed_by)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN 'move'
        ELSE 'update'
      END,
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO category_history (category_id, action, changes, performed_by)
    VALUES (OLD.id, 'delete', to_jsonb(OLD), auth.uid());
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging changes
CREATE TRIGGER log_category_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscription_categories
  FOR EACH ROW EXECUTE FUNCTION log_category_changes();

-- Create indexes
CREATE INDEX idx_category_attributes_category ON category_attributes(category_id);
CREATE INDEX idx_category_history_category ON category_history(category_id);
CREATE INDEX idx_category_history_date ON category_history(created_at);