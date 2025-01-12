import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserSettings } from './UserSettings';
import { CategoryManager } from './CategoryManager';
import { 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  FolderTree,
  X
} from 'lucide-react';

type MenuView = 'profile' | 'categories' | null;

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<MenuView>(null);

  if (!user) return null;

  return (
    <div className="relative">
      <div className="relative inline-block text-left">
        <button
          onClick={() => setActiveView(activeView ? null : 'profile')}
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="mr-2">{user.email}</span>
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {activeView && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setActiveView(null)} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('profile')}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      activeView === 'profile'
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={() => setActiveView('categories')}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      activeView === 'categories'
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FolderTree className="w-5 h-5 mr-2" />
                    Categories
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={signOut}
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Sign Out
                  </button>
                  <button
                    onClick={() => setActiveView(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeView === 'profile' && <UserSettings user={user} />}
                {activeView === 'categories' && <CategoryManager />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}