import React from 'react';
import type { Currency, FiatCurrency, CryptoCurrency } from '../types/subscription';

interface Props {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function CurrencyToggle({ currency, onCurrencyChange }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <label className="sr-only">Currency</label>
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        className="w-[120px] rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm py-2"
      >
        <optgroup label="Fiat">
          <option value="USD">$ - USD</option>
          <option value="EUR">€ - EUR</option>
          <option value="GBP">£ - GBP</option>
          {/* Add more concise options as needed */}
        </optgroup>
        <optgroup label="Crypto">
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          {/* Add more concise options as needed */}
        </optgroup>
      </select>
    </div>
  );
}