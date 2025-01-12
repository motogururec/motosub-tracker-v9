import React from 'react';
import { Save, X, AlertTriangle, Trash2 } from 'lucide-react';
import type { SubscriptionFormData, Currency } from '../types/subscription';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';

interface Props {
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  initialData?: SubscriptionFormData;
  isEditing?: boolean;
}

export function SubscriptionForm({ onSubmit, onCancel, onDelete, initialData, isEditing = false }: Props) {
  const { formatCurrencyValue } = useCurrencyConverter();
  const [formData, setFormData] = React.useState<SubscriptionFormData>(
    initialData || {
      service_name: '',
      cost: 0,
      currency: 'USD',
      billing_cycle: 'monthly',
      billing_date: new Date().toISOString().split('T')[0],
      category: 'other',
      payment_method: '',
    }
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCycleChange = (newCycle: 'monthly' | 'annual') => {
    const newCost = newCycle === 'annual' 
      ? formData.cost * 12 
      : formData.cost / 12;
    setFormData({ 
      ...formData, 
      billing_cycle: newCycle,
      cost: Number(newCost.toFixed(2))
    });
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
          </h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Service Name
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                required
                min="0"
                step="any"
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Currency
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            >
              <optgroup label="Fiat Currencies">
                <option value="USD">$ - US Dollar</option>
                <option value="EUR">€ - Euro</option>
                <option value="GBP">£ - British Pound</option>
                <option value="JPY">¥ - Japanese Yen</option>
                <option value="AUD">$ - Australian Dollar</option>
                <option value="CAD">$ - Canadian Dollar</option>
                <option value="CHF">Fr - Swiss Franc</option>
                <option value="CNY">¥ - Chinese Yuan</option>
                <option value="HKD">$ - Hong Kong Dollar</option>
                <option value="NZD">$ - New Zealand Dollar</option>
                <option value="SEK">kr - Swedish Krona</option>
                <option value="KRW">₩ - South Korean Won</option>
                <option value="SGD">$ - Singapore Dollar</option>
                <option value="NOK">kr - Norwegian Krone</option>
                <option value="MXN">$ - Mexican Peso</option>
                <option value="INR">₹ - Indian Rupee</option>
                <option value="RUB">₽ - Russian Ruble</option>
                <option value="ZAR">R - South African Rand</option>
                <option value="TRY">₺ - Turkish Lira</option>
                <option value="BRL">R$ - Brazilian Real</option>
                <option value="HUF">Ft - Hungarian Forint</option>
              </optgroup>
              <optgroup label="Cryptocurrencies">
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
                <option value="USDT">USDT - Tether</option>
                <option value="BNB">BNB - Binance Coin</option>
                <option value="XRP">XRP - Ripple</option>
                <option value="USDC">USDC - USD Coin</option>
                <option value="SOL">SOL - Solana</option>
                <option value="ADA">ADA - Cardano</option>
                <option value="DOGE">DOGE - Dogecoin</option>
                <option value="TRX">TRX - TRON</option>
                <option value="TON">TON - Toncoin</option>
                <option value="DOT">DOT - Polkadot</option>
                <option value="MATIC">MATIC - Polygon</option>
                <option value="DAI">DAI - Dai</option>
                <option value="WBTC">WBTC - Wrapped Bitcoin</option>
                <option value="AVAX">AVAX - Avalanche</option>
                <option value="SHIB">SHIB - Shiba Inu</option>
                <option value="LTC">LTC - Litecoin</option>
                <option value="LINK">LINK - Chainlink</option>
                <option value="BCH">BCH - Bitcoin Cash</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Cycle
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={formData.billing_cycle}
              onChange={(e) => handleCycleChange(e.target.value as 'monthly' | 'annual')}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Date
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={formData.billing_date}
              onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="streaming">Streaming</option>
              <option value="software">Software</option>
              <option value="gaming">Gaming</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Method
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          />
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Add Subscription'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
          </div>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 text-yellow-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}