/*
  # Add currency column to subscriptions table

  1. Changes
    - Add currency column to subscriptions table with default value 'USD'
    - Add check constraint to ensure valid currency values
    - Update existing rows to use default currency

  2. Notes
    - Uses enum type for currency to ensure data integrity
    - Includes both fiat and crypto currencies
    - Maintains backward compatibility with existing data
*/

-- Create currency type
DO $$ BEGIN
    CREATE TYPE subscription_currency AS ENUM (
        -- Fiat currencies
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 
        'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 
        'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 
        'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 
        'HUF',
        -- Crypto currencies
        'BTC', 'ETH', 'USDT', 'BNB', 'XRP', 
        'USDC', 'SOL', 'ADA', 'DOGE', 'TRX', 
        'TON', 'DOT', 'MATIC', 'DAI', 'WBTC', 
        'AVAX', 'SHIB', 'LTC', 'LINK', 'BCH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add currency column with default value
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS currency subscription_currency NOT NULL DEFAULT 'USD';

-- Create index for currency column
CREATE INDEX IF NOT EXISTS idx_subscriptions_currency 
ON subscriptions(currency);

-- Add comment to explain the column
COMMENT ON COLUMN subscriptions.currency IS 
'The currency of the subscription cost. Supports both fiat and crypto currencies.';