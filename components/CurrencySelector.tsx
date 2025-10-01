import React, { useState } from 'react';
import { useCurrency, type CurrencyCode } from '../contexts/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, getAllCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAllCurrencies();

  const handleCurrencyChange = (currencyCode: CurrencyCode) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          color: 'var(--color-text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '80px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }}
      >
        <span style={{ fontWeight: 600 }}>{currency.symbol}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          {currency.code}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            minWidth: '200px'
          }}
        >
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: curr.code === currency.code ? 'var(--color-primary-alpha)' : 'transparent',
                border: 'none',
                color: curr.code === currency.code ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: curr.code === currencies[0].code ? '0.375rem 0.375rem 0 0' : 
                           curr.code === currencies[currencies.length - 1].code ? '0 0 0.375rem 0.375rem' : '0'
              }}
              onMouseEnter={(e) => {
                if (curr.code !== currency.code) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (curr.code !== currency.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{curr.symbol}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500 }}>{curr.code}</div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '140px'
                  }}>
                    {curr.namePortuguese}
                  </div>
                </div>
              </div>
              {curr.code === currency.code && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
        />
      )}
    </div>
  );
};

export default CurrencySelector;