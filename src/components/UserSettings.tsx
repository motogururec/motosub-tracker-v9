import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Camera, 
  Lock, 
  Mail, 
  Bell, 
  Moon, 
  Clock, 
  Loader2, 
  Check, 
  X 
} from 'lucide-react';
import type { UserProfile } from '../types/user';

interface Props {
  user: User;
  onAvatarChange?: (url: string) => void;
}

export function UserSettings({ user, onAvatarChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; } | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserProfile['preferences']>({
    notifications_enabled: true,
    theme: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user.id]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile) {
        setPreferences(profile.preferences);
        setAvatar(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load user profile'
      });
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error('Only JPG and PNG images are allowed');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('user_profiles')
        .upsert({ id: user.id, avatar_url: publicUrl });

      setAvatar(publicUrl);
      if (onAvatarChange) onAvatarChange(publicUrl);
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating avatar' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setIsChangingPassword(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const newEmail = formData.get('newEmail') as string;

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
      setMessage({ 
        type: 'success', 
        text: 'Verification email sent. Please check your inbox.' 
      });
      setIsChangingEmail(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating email' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = async (
    key: keyof UserProfile['preferences'],
    value: string | boolean
  ) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Preferences updated successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating preferences' 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Account Settings
      </h2>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <X className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Profile Information
        </h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${user.email}`}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              JPG or PNG. Max size of 5MB.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Change Form */}
          {isChangingEmail ? (
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Email
                </label>
                <input
                  type="email"
                  name="newEmail"
                  id="newEmail"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingEmail(false)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => setIsChangingEmail(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                Change Email
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Security
        </h3>

        {/* Password Change Form */}
        {isChangingPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </button>
        )}
      </section>

      {/* Preferences Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Preferences
        </h3>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <label htmlFor="notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email notifications about your subscriptions
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={preferences.notifications_enabled}
                onChange={(e) => handlePreferencesChange('notifications_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="h-5 w-5 text-gray-400" />
              <div>
                <label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred theme
                </p>
              </div>
            </div>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => handlePreferencesChange('theme', e.target.value as 'light' | 'dark' | 'system')}
              className="mt-1 block w-40 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Zone
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set your local time zone
                </p>
              </div>
            </div>
            <select
              id="timezone"
              value={preferences.timezone}
              onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
              className="mt-1 block w-40 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}