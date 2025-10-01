import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'MZN' | 'BRL' | 'USD' | 'EUR' | 'ZAR' | 'GBP';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  namePortuguese: string;
  locale: string;
  exchangeRate: number; // Rate relative to MZN (1 MZN = ? other currency)
}

export const CURRENCIES: Currency[] = [
  {
    code: 'MZN',
    symbol: 'MT',
    name: 'Mozambican Metical',
    namePortuguese: 'Metical Moçambicano',
    locale: 'pt-MZ',
    exchangeRate: 1
  },
  {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    namePortuguese: 'Real Brasileiro',
    locale: 'pt-BR',
    exchangeRate: 0.31 // 1 MZN ≈ 0.31 BRL (approximate)
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    namePortuguese: 'Dólar Americano',
    locale: 'en-US',
    exchangeRate: 0.016 // 1 MZN ≈ 0.016 USD (approximate)
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    namePortuguese: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.015 // 1 MZN ≈ 0.015 EUR (approximate)
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    namePortuguese: 'Rand Sul-africano',
    locale: 'en-ZA',
    exchangeRate: 0.28 // 1 MZN ≈ 0.28 ZAR (approximate)
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    namePortuguese: 'Libra Esterlina',
    locale: 'en-GB',
    exchangeRate: 0.012 // 1 MZN ≈ 0.012 GBP (approximate)
  }
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currencyCode: CurrencyCode) => void;
  formatCurrency: (value: number, targetCurrency?: CurrencyCode) => string;
  convertCurrency: (value: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
  getAllCurrencies: () => Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]); // Default to MZN

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as CurrencyCode;
    if (savedCurrency) {
      const foundCurrency = CURRENCIES.find(c => c.code === savedCurrency);
      if (foundCurrency) {
        setCurrencyState(foundCurrency);
      }
    }
  }, []);

  const setCurrency = (currencyCode: CurrencyCode) => {
    const foundCurrency = CURRENCIES.find(c => c.code === currencyCode);
    if (foundCurrency) {
      setCurrencyState(foundCurrency);
      localStorage.setItem('currency', currencyCode);
    }
  };

  const convertCurrency = (value: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    if (fromCurrency === toCurrency) return value;
    
    const fromRate = CURRENCIES.find(c => c.code === fromCurrency)?.exchangeRate || 1;
    const toRate = CURRENCIES.find(c => c.code === toCurrency)?.exchangeRate || 1;
    
    // Convert to MZN first, then to target currency
    const mznValue = value / fromRate;
    return mznValue * toRate;
  };

  const formatCurrency = (value: number, targetCurrency?: CurrencyCode): string => {
    if (typeof value !== 'number') return '0,00';
    
    const currencyToUse = targetCurrency ? 
      CURRENCIES.find(c => c.code === targetCurrency) || currency : 
      currency;
    
    // Always convert from MZN (base currency) to the selected currency
    // unless explicitly targeting a different currency
    const fromCurrency: CurrencyCode = 'MZN';
    const toCurrency = targetCurrency || currency.code;
    
    const convertedValue = convertCurrency(value, fromCurrency, toCurrency);
    
    const numberPart = new Intl.NumberFormat(currencyToUse.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(convertedValue));
    
    const sign = convertedValue < 0 ? '-' : '';
    return `${sign}${numberPart} ${currencyToUse.symbol}`;
  };

  const getAllCurrencies = () => CURRENCIES;

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatCurrency,
      convertCurrency,
      getAllCurrencies
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};