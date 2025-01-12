export type FiatCurrency = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' 
  | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'NZD' 
  | 'SEK' | 'KRW' | 'SGD' | 'NOK' | 'MXN' 
  | 'INR' | 'RUB' | 'ZAR' | 'TRY' | 'BRL' 
  | 'HUF';

export type CryptoCurrency = 
  | 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'XRP' 
  | 'USDC' | 'SOL' | 'ADA' | 'DOGE' | 'TRX' 
  | 'TON' | 'DOT' | 'MATIC' | 'DAI' | 'WBTC' 
  | 'AVAX' | 'SHIB' | 'LTC' | 'LINK' | 'BCH';

export type Currency = FiatCurrency | CryptoCurrency;

export type Category = 'streaming' | 'software' | 'gaming' | 'other';
export type BillingCycle = 'monthly' | 'annual';

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  cost: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  billing_date: string;
  category: Category;
  payment_method: string;
  created_at: string;
  next_billing_date: string;
}

export interface SubscriptionFormData extends Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'next_billing_date'> {}