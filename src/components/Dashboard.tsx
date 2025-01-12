import React from 'react';
import { PieChart, BarChart, Calendar, DollarSign } from 'lucide-react';
import type { Subscription, Currency } from '../types/subscription';

interface Props {
  subscriptions: Subscription[];
  formatCurrency: (amount: number, currency: Currency) => string;
}

export function Dashboard({ subscriptions, formatCurrency }: Props) {
  // Calculate total monthly spending with proper currency conversion
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    const monthlyAmount = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12;
    return acc + Number(formatCurrency(monthlyAmount, sub.currency).replace(/[^0-9.-]+/g, ''));
  }, 0);

  // Calculate category totals with proper currency conversion
  const categoryTotals = subscriptions.reduce((acc, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12;
    const convertedCost = Number(formatCurrency(monthlyCost, sub.currency).replace(/[^0-9.-]+/g, ''));
    acc[sub.category] = (acc[sub.category] || 0) + convertedCost;
    return acc;
  }, {} as Record<string, number>);

  // Get upcoming renewals for the next 30 days
  const upcomingRenewals = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return subscriptions
      .filter((sub) => {
        const renewalDate = new Date(sub.next_billing_date);
        renewalDate.setHours(0, 0, 0, 0);
        return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime());
  }, [subscriptions]);

  // Format date with relative time
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Total</h3>
          <DollarSign className="h-5 w-5 text-blue-500" />
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(totalMonthly, 'USD')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Subscriptions</h3>
          <BarChart className="h-5 w-5 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
          {subscriptions.length}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Categories</h3>
          <PieChart className="h-5 w-5 text-purple-500" />
        </div>
        <div className="mt-2 space-y-1">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <div key={category} className="flex justify-between text-sm">
              <span className="capitalize text-gray-700 dark:text-gray-300">{category}</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(total, 'USD')}/mo</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Renewals</h3>
          <Calendar className="h-5 w-5 text-red-500" />
        </div>
        <div className="mt-2 space-y-3">
          {upcomingRenewals.length > 0 ? (
            upcomingRenewals.map((sub) => (
              <div key={sub.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sub.service_name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatRelativeDate(sub.next_billing_date)}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatCurrency(sub.cost, sub.currency)}
                  <span className="text-xs ml-1">
                    /{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No upcoming renewals in the next 30 days
            </p>
          )}
        </div>
      </div>
    </div>
  );
}