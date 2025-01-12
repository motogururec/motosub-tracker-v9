export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  is_enabled: boolean;
  display_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date';
  default_value?: string;
  is_required: boolean;
  created_at: string;
  user_id: string;
}

export interface CategoryHistory {
  id: string;
  category_id: string;
  action: 'create' | 'update' | 'delete' | 'move';
  changes: Record<string, any>;
  performed_by: string;
  created_at: string;
}