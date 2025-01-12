import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Download,
  Upload,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings,
  Save,
  X
} from 'lucide-react';
import type { Category, CategoryAttribute } from '../types/category';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_categories')
        .select(`
          *,
          attributes:category_attributes(*)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (formData: FormData) => {
    try {
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        parent_id: formData.get('parent_id') as string || null,
        is_enabled: true,
        display_order: categories.length
      };

      const { error } = await supabase
        .from('subscription_categories')
        .insert([categoryData]);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (id: string, formData: FormData) => {
    try {
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        parent_id: formData.get('parent_id') as string || null,
        is_enabled: formData.get('is_enabled') === 'true'
      };

      const { error } = await supabase
        .from('subscription_categories')
        .update(categoryData)
        .eq('id', id);

      if (error) throw error;
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      // Check if category has subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('category', id)
        .limit(1);

      if (subscriptions?.length) {
        setShowDeleteWarning(id);
        return;
      }

      const { error } = await supabase
        .from('subscription_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleMoveCategory = async (id: string, direction: 'up' | 'down') => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const siblings = categories.filter(c => c.parent_id === category.parent_id);
    const currentIndex = siblings.findIndex(c => c.id === id);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === siblings.length - 1)
    ) return;

    const newOrder = [...siblings];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];

    try {
      const updates = newOrder.map((cat, index) => ({
        id: cat.id,
        display_order: index
      }));

      const { error } = await supabase
        .from('subscription_categories')
        .upsert(updates);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move category');
    }
  };

  const exportCategories = () => {
    const data = JSON.stringify(categories, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCategories = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!Array.isArray(data)) throw new Error('Invalid file format');

      const { error } = await supabase
        .from('subscription_categories')
        .insert(data.map(({ id, created_at, updated_at, ...category }) => category));

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import categories');
    }
  };

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const filteredCategories = categories
      .filter(cat => cat.parent_id === parentId)
      .filter(cat => 
        filter === '' || 
        cat.name.toLowerCase().includes(filter.toLowerCase()) ||
        cat.description?.toLowerCase().includes(filter.toLowerCase())
      );

    if (!filteredCategories.length) return null;

    return (
      <div className="space-y-2" style={{ marginLeft: level * 24 }}>
        {filteredCategories.map(category => (
          <div key={category.id}>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <FolderTree className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMoveCategory(category.id, 'up')}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <MoveUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleMoveCategory(category.id, 'down')}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <MoveDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {renderCategoryTree(category.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Category Management
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportCategories}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <label className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importCategories}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Filter categories..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as 'name' | 'created_at')}
          className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="name">Sort by Name</option>
          <option value="created_at">Sort by Date</option>
        </select>
        <button
          onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {renderCategoryTree()}

      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 text-yellow-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Warning
              </h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This category has subscriptions assigned to it. Deleting it will affect these subscriptions.
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteWarning(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteCategory(showDeleteWarning);
                  setShowDeleteWarning(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}