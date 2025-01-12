import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import type { Subscription, Currency } from '../types/subscription';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  subscriptions: Subscription[];
  formatCurrency: (amount: number, fromCurrency: Currency) => string;
}

export function SubscriptionCharts({ subscriptions, formatCurrency }: Props) {
  // Sort subscriptions by date for consistent timeline
  const sortedSubscriptions = [...subscriptions].sort(
    (a, b) => new Date(a.billing_date).getTime() - new Date(b.billing_date).getTime()
  );

  // Calculate category totals with proper currency conversion
  const categoryData = sortedSubscriptions.reduce((acc, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12;
    const convertedCost = Number(formatCurrency(monthlyCost, sub.currency).replace(/[^0-9.-]+/g, ''));
    acc[sub.category] = (acc[sub.category] || 0) + convertedCost;
    return acc;
  }, {} as Record<string, number>);

  // Calculate monthly spending trend with proper date handling
  const monthlyData = sortedSubscriptions.reduce((acc, sub) => {
    const date = new Date(sub.billing_date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12;
    const convertedCost = Number(formatCurrency(monthlyCost, sub.currency).replace(/[^0-9.-]+/g, ''));
    acc[monthYear] = (acc[monthYear] || 0) + convertedCost;
    return acc;
  }, {} as Record<string, number>);

  // Calculate billing cycle distribution
  const billingCycleData = sortedSubscriptions.reduce((acc, sub) => {
    acc[sub.billing_cycle] = (acc[sub.billing_cycle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartColors = {
    streaming: '#3B82F6', // blue
    software: '#10B981', // green
    gaming: '#8B5CF6',   // purple
    other: '#F59E0B',    // yellow
  };

  const pieChartData = {
    labels: Object.keys(categoryData).map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: Object.keys(categoryData).map((cat) => chartColors[cat as keyof typeof chartColors]),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  const lineChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Spending',
        data: Object.values(monthlyData),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: ['Monthly', 'Annual'],
    datasets: [
      {
        label: 'Number of Subscriptions',
        data: [billingCycleData.monthly || 0, billingCycleData.annual || 0],
        backgroundColor: ['#3B82F6', '#10B981'],
        borderColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
    },
  };

  const pieChartOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = formatCurrency(context.raw, 'USD');
            return `${context.label}: ${value}/month`;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...baseOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: (value: number) => formatCurrency(value, 'USD'),
        },
      },
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Spending: ${formatCurrency(context.raw, 'USD')}`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...baseOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Spending by Category
        </h3>
        <div className="h-64">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Spending Trend
        </h3>
        <div className="h-64">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Billing Cycle Distribution
        </h3>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
}