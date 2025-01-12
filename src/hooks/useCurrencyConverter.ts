import { useState, useEffect } from 'react';
import type { Currency } from '../types/subscription';

interface ExchangeRates {
  [key: string]: number;
}

const FALLBACK_RATES: ExchangeRates = {
  // Fiat fallback rates
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 148.50,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.87,
  CNY: 7.19,
  HKD: 7.82,
  NZD: 1.64,
  SEK: 10.42,
  KRW: 1325.76,
  SGD: 1.34,
  NOK: 10.51,
  MXN: 17.05,
  INR: 83.12,
  RUB: 92.50,
  ZAR: 18.87,
  TRY: 30.75,
  BRL: 4.95,
  HUF: 360,
  // Crypto fallback rates (example values)
  BTC: 0.000024,
  ETH: 0.00037,
  USDT: 1,
  BNB: 0.0033,
  XRP: 1.85,
  USDC: 1,
  SOL: 0.014,
  ADA: 2.1,
  DOGE: 13.5,
  TRX: 11.2,
  TON: 0.45,
  DOT: 0.16,
  MATIC: 1.2,
  DAI: 1,
  WBTC: 0.000024,
  AVAX: 0.037,
  SHIB: 38000,
  LTC: 0.012,
  LINK: 0.075,
  BCH: 0.004
};

const API_ENDPOINTS = {
  FIAT: [
    'https://api.exchangerate-api.com/v4/latest/USD',
    'https://api.fixer.io/latest?base=USD',
    'https://open.er-api.com/v6/latest/USD'
  ],
  CRYPTO: [
    'https://api.coincap.io/v2/assets',
    'https://api.coingecko.com/api/v3/simple/price',
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
  ]
};

export function useCurrencyConverter() {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const fetchFiatRates = async () => {
      for (const endpoint of API_ENDPOINTS.FIAT) {
        try {
          const response = await fetchWithTimeout(endpoint);
          if (!response.ok) continue;
          const data = await response.json();
          return data.rates || data;
        } catch {
          continue;
        }
      }
      throw new Error('All fiat rate endpoints failed');
    };

    const fetchCryptoRates = async () => {
      for (const endpoint of API_ENDPOINTS.CRYPTO) {
        try {
          const response = await fetchWithTimeout(endpoint);
          if (!response.ok) continue;
          const data = await response.json();
          
          // Handle different API response formats
          if (endpoint.includes('coincap')) {
            return data.data.reduce((acc: ExchangeRates, coin: any) => {
              const symbol = coin.symbol.toUpperCase();
              acc[symbol] = 1 / parseFloat(coin.priceUsd);
              return acc;
            }, {});
          } else if (endpoint.includes('coingecko')) {
            return Object.entries(data).reduce((acc: ExchangeRates, [symbol, price]: [string, any]) => {
              acc[symbol.toUpperCase()] = 1 / price.usd;
              return acc;
            }, {});
          }
          // Add more API response handlers as needed
        } catch {
          continue;
        }
      }
      throw new Error('All crypto rate endpoints failed');
    };

    const fetchRates = async () => {
      try {
        const [fiatRates, cryptoRates] = await Promise.allSettled([
          fetchFiatRates(),
          fetchCryptoRates()
        ]);

        if (mounted) {
          const newRates = { ...FALLBACK_RATES };

          if (fiatRates.status === 'fulfilled') {
            Object.assign(newRates, fiatRates.value);
          }

          if (cryptoRates.status === 'fulfilled') {
            Object.assign(newRates, cryptoRates.value);
          }

          setRates(newRates);
          setLastUpdated(new Date());
          setError(null);
          retryCount = 0;
        }
      } catch (err) {
        console.error('Error fetching rates:', err);
        
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          setTimeout(fetchRates, retryDelay * retryCount);
          setError(`Retrying to fetch rates... (Attempt ${retryCount}/${maxRetries})`);
        } else if (mounted) {
          setError('Using fallback exchange rates due to connection issues');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRates();

    // Refresh rates every 5 minutes if the last attempt was successful
    const interval = setInterval(() => {
      if (!error) {
        fetchRates();
      }
    }, 300000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const convertAmount = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    // Convert to USD first
    const usdAmount = from === 'USD' ? amount : amount / rates[from];
    // Convert from USD to target currency
    return usdAmount * rates[to];
  };

  const formatCurrencyValue = (amount: number, currency: Currency): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: currency in CRYPTO_DECIMALS ? CRYPTO_DECIMALS[currency as keyof typeof CRYPTO_DECIMALS] : 2
    });

    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
      CAD: 'C$', CHF: 'Fr', CNY: '¥', HKD: 'HK$', NZD: 'NZ$',
      SEK: 'kr', KRW: '₩', SGD: 'S$', NOK: 'kr', MXN: 'Mex$',
      INR: '₹', RUB: '₽', ZAR: 'R', TRY: '₺', BRL: 'R$',
      HUF: 'Ft'
    };

    const value = formatter.format(amount);
    return currency in symbols ? `${symbols[currency]}${value}` : `${value} ${currency}`;
  };

  return { 
    rates, 
    loading, 
    error, 
    lastUpdated,
    convertAmount, 
    formatCurrencyValue 
  };
}

const CRYPTO_DECIMALS = {
  BTC: 8,
  ETH: 6,
  USDT: 2,
  BNB: 6,
  XRP: 4,
  USDC: 2,
  SOL: 4,
  ADA: 4,
  DOGE: 4,
  TRX: 4,
  TON: 4,
  DOT: 4,
  MATIC: 4,
  DAI: 2,
  WBTC: 8,
  AVAX: 4,
  SHIB: 8,
  LTC: 6,
  LINK: 4,
  BCH: 6
};