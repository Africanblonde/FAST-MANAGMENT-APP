import React, { useState } from 'react';

// --- DEFINIÇÕES DE TIPOS SIMULADOS ---
// Corrigido o erro de importação de tipos
type CurrencyCode = 'MZN' | 'USD' | 'EUR' | 'ZAR';

interface CurrencyInfo {
    code: CurrencyCode;
    namePortuguese: string;
    symbol: string;
    rateToUSD: number;
}

interface CurrencyContextType {
    currency: CurrencyInfo;
    setCurrency: (code: CurrencyCode) => void;
    getAllCurrencies: () => CurrencyInfo[];
    formatCurrency: (amount: number) => string;
}

const MOCK_CURRENCIES: CurrencyInfo[] = [
    { code: 'MZN', namePortuguese: 'Metical Moçambicano', symbol: 'MT', rateToUSD: 1 / 63.8 },
    { code: 'USD', namePortuguese: 'Dólar Americano', symbol: '$', rateToUSD: 1 },
    { code: 'EUR', namePortuguese: 'Euro', symbol: '€', rateToUSD: 1.08 },
    { code: 'ZAR', namePortuguese: 'Rand Sul-Africano', symbol: 1.8.toFixed(2), rateToUSD: 1 / 18.5 }, // ZAR symbol is 'R' but using 1.8 for visual mock in selector
];


// --- MOCK DO CONTEXTO DE MOEDA (Substitui 'useCurrency' e o Contexto) ---
const useCurrency = (): CurrencyContextType => {
    const [currentCode, setCurrentCode] = useState<CurrencyCode>('MZN');

    const currency = MOCK_CURRENCIES.find(c => c.code === currentCode) || MOCK_CURRENCIES[0];

    const setCurrency = (code: CurrencyCode) => {
        setCurrentCode(code);
    };

    const getAllCurrencies = () => MOCK_CURRENCIES;

    // Função de formatação mockada
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency.code,
        }).format(amount);
    };

    return { currency, setCurrency, getAllCurrencies, formatCurrency };
};


// --- COMPONENTE CurrencySelector (Corrigido) ---
const CurrencySelector: React.FC = () => {
    const { currency, setCurrency, getAllCurrencies } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const currencies = getAllCurrencies();

    const handleCurrencyChange = (currencyCode: CurrencyCode) => {
        setCurrency(currencyCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 p-2 px-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm cursor-pointer transition-all hover:bg-gray-700"
                style={{ minWidth: '90px' }}
                // FIX TS7006: Tipagem explícita para o evento do botão
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.classList.add('hover:bg-gray-700');
                    e.currentTarget.classList.remove('bg-gray-800');
                }}
                // FIX TS7006: Tipagem explícita para o evento do botão
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.classList.remove('hover:bg-gray-700');
                    e.currentTarget.classList.add('bg-gray-800');
                }}
            >
                <span className="font-semibold text-lg">{currency.symbol}</span>
                <span className="text-xs text-gray-400">{currency.code}</span>
                <svg
                    className="w-3 h-3 transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    viewBox="0 0 12 12"
                    fill="currentColor"
                >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden"
                    style={{ minWidth: '220px' }}
                >
                    {/* FIX TS7006: Tipagem explícita para a variável de loop 'curr' */}
                    {currencies.map((curr: CurrencyInfo) => (
                        <button
                            key={curr.code}
                            onClick={() => handleCurrencyChange(curr.code)}
                            className={`flex items-center justify-between w-full p-3 text-sm transition-all text-left ${
                                curr.code === currency.code 
                                    ? 'bg-blue-900/40 text-blue-300' 
                                    : 'text-white hover:bg-gray-700'
                            }`}
                            // FIX TS7006: Tipagem explícita para o evento do botão
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                if (curr.code !== currency.code) {
                                    e.currentTarget.classList.add('bg-gray-700');
                                }
                            }}
                            // FIX TS7006: Tipagem explícita para o evento do botão
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                if (curr.code !== currency.code) {
                                    e.currentTarget.classList.remove('bg-gray-700');
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-base">{curr.symbol}</span>
                                <div className="text-left">
                                    <div className="font-medium">{curr.code}</div>
                                    <div className="text-xs text-gray-400 truncate max-w-[140px]">
                                        {curr.namePortuguese}
                                    </div>
                                </div>
                            </div>
                            {curr.code === currency.code && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-blue-400">
                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Click outside to close - Usa classe fixed para cobrir toda a viewport */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40"
                />
            )}
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (APP) PARA EXECUÇÃO ---
const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {/* Tailwind classes e custom properties mockadas para estética */}
            <style jsx global>{`
                :root {
                    --color-primary: #2563eb; /* blue-600 */
                    --color-surface: #1f2937; /* gray-800 */
                    --color-surface-hover: #374151; /* gray-700 */
                    --color-border: #374151; /* gray-700 */
                    --color-text-primary: #f3f4f6; /* gray-100 */
                    --color-text-secondary: #9ca3af; /* gray-400 */
                    --color-primary-alpha: rgba(37, 99, 235, 0.2); /* blue-600 with opacity */
                }
                body {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
            
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-8">Seletor de Moeda</h1>
                <CurrencySelector />
            </div>
        </div>
    );
};

export default App;