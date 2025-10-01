import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
// FIX: Changed to a named import to resolve module resolution error.
import { App } from './App';

const AppWrapper: React.FC = () => {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </LanguageProvider>
  );
};

export default AppWrapper;
