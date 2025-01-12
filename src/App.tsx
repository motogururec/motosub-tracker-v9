import React from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { SubscriptionForm } from './components/SubscriptionForm';
import { ThemeToggle } from './components/ThemeToggle';
import { CurrencyToggle } from './components/CurrencyToggle';
import { AuthForm } from './components/AuthForm';
import { SubscriptionCharts } from './components/SubscriptionCharts';
import { UserMenu } from './components/UserMenu';
import { useAuth } from './hooks/useAuth';
import { useCurrencyConverter } from './hooks/useCurrencyConverter';
import type { Subscription, SubscriptionFormData, Currency } from './types/subscription';
import { Search, Filter, Download, PlusCircle, Edit2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingSubscription, setEditingSubscription] = React.useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currency, setCurrency] = React.useState<Currency>('USD');
  const { convertAmount, formatCurrencyValue, loading: ratesLoading } = useCurrencyConverter();

  React.useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('next_billing_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = async (formData: SubscriptionFormData) => {
    try {
      const nextBillingDate = new Date(formData.billing_date);
      if (formData.billing_cycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const { error } = await supabase.from('subscriptions').insert([
        {
          ...formData,
          user_id: user?.id,
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
        },
      ]);

      if (error) throw error;
      fetchSubscriptions();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateSubscription = async (formData: SubscriptionFormData) => {
    if (!editingSubscription) return;

    try {
      const nextBillingDate = new Date(formData.billing_date);
      if (formData.billing_cycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          ...formData,
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;
      fetchSubscriptions();
      setEditingSubscription(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      fetchSubscriptions();
      setEditingSubscription(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number, fromCurrency: Currency): string => {
    const convertedAmount = convertAmount(amount, fromCurrency, currency);
    return formatCurrencyValue(convertedAmount, currency);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={fetchSubscriptions} />;
  }

  if (isLoading || ratesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading your subscriptions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Subscription Tracker
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Welcome back | Manage and monitor your subscriptions in one place
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center justify-end gap-3">
              <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
              <ThemeToggle />
            </div>
            <UserMenu />
          </div>
        </div>

        <Dashboard 
          subscriptions={subscriptions} 
          formatCurrency={formatCurrency} 
        />
        
        <SubscriptionCharts 
          subscriptions={subscriptions} 
          formatCurrency={formatCurrency} 
        />

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="streaming">Streaming</option>
                <option value="software">Software</option>
                <option value="gaming">Gaming</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingSubscription(null);
                setShowAddForm(!showAddForm);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Subscription
            </button>
          </div>

          {(showAddForm || editingSubscription) && (
            <div className="mb-6">
              <SubscriptionForm 
                onSubmit={editingSubscription ? handleUpdateSubscription : handleAddSubscription}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingSubscription(null);
                }}
                onDelete={editingSubscription ? () => handleDeleteSubscription(editingSubscription.id) : undefined}
                initialData={editingSubscription || undefined}
                isEditing={!!editingSubscription}
              />
            </div>
          )}

          <div className="space-y-4">
            {subscriptions
              .filter(sub => 
                (selectedCategory === 'all' || sub.category === selectedCategory) &&
                (searchTerm === '' || 
                  sub.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  sub.payment_method.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map(subscription => (
                <div
                  key={subscription.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {subscription.service_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Payment method: {subscription.payment_method}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(subscription.cost, subscription.currency)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </span>
                    <button
                      onClick={() => setEditingSubscription(subscription)}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      aria-label="Edit subscription"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}