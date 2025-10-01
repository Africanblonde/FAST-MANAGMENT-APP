import type { Invoice, InvoiceStatus, LayoutSettings, PaymentMethod } from '../types';

export const initialLayoutSettings: LayoutSettings = {
  companyName: 'Fast Managment',
  quotationTitle: 'Cotação',
  invoiceTitle: 'Factura Recibo',
  collectionInvoiceTitle: 'Factura de Cobrança',
  footerNuit: 'Nuit: 40045689',
  footerContact: 'Contacto: (+258) 84 123 4567',
  footerAddress: 'Av. de Moçambique, Bairro do Jardim, Maputo',
  footerMessage: 'Obrigado pela preferência!',
  taxEnabled: true,
  taxName: 'IVA',
  taxRate: 17,
  invoicePrefix: 'FACT-',
  invoiceNextNumber: 1,
};

export const initialPaymentMethods: PaymentMethod[] = [
    { name: 'M-Pesa', initialBalance: 0 },
    { name: 'E-mola', initialBalance: 0 },
    { name: 'Mozabanco', initialBalance: 0 },
    { name: 'BIM', initialBalance: 0 },
    { name: 'BCI', initialBalance: 0 },
    { name: 'Numerário', initialBalance: 0 },
];

// Legacy formatCurrency function - now uses current currency from localStorage
// New components should use useCurrency().formatCurrency() instead
export const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '0,00 MT';
    
    // Get current currency from localStorage
    const savedCurrency = localStorage.getItem('currency');
    const currentCurrency = getCurrencyInfo(savedCurrency as any);
    
    // Convert value from MZN to selected currency
    const convertedValue = value * currentCurrency.exchangeRate;
    
    const numberPart = new Intl.NumberFormat(currentCurrency.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(convertedValue));
    
    const sign = convertedValue < 0 ? '-' : '';
    return `${sign}${numberPart} ${currentCurrency.symbol}`;
}

// Helper function to get currency info
const getCurrencyInfo = (currencyCode: string) => {
    const currencies = {
        'MZN': { symbol: 'MT', locale: 'pt-MZ', exchangeRate: 1 },
        'BRL': { symbol: 'R$', locale: 'pt-BR', exchangeRate: 0.31 },
        'USD': { symbol: '$', locale: 'en-US', exchangeRate: 0.016 },
        'EUR': { symbol: '€', locale: 'de-DE', exchangeRate: 0.015 },
        'ZAR': { symbol: 'R', locale: 'en-ZA', exchangeRate: 0.28 },
        'GBP': { symbol: '£', locale: 'en-GB', exchangeRate: 0.012 }
    };
    return currencies[currencyCode as keyof typeof currencies] || currencies['MZN'];
}

export const getInvoiceStatusAndBalance = (invoice: Invoice): { status: InvoiceStatus, balance: number, totalPaid: number } => {
    if (!invoice) return { status: 'Pendente', balance: 0, totalPaid: 0};
    
    const totalPaidFromPayments = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        
    const balance = invoice.total - totalPaidFromPayments;
    let status: InvoiceStatus = 'Pendente';
    
    if (balance <= 0.01 && invoice.total > 0) {
        status = 'Pago';
    } else if (totalPaidFromPayments > 0 && balance > 0.01) {
        status = 'Pago Parcialmente';
    } else if (totalPaidFromPayments <= 0) {
        const today = new Date();
        const issueDate = new Date(invoice.issueDate);
        const diffTime = today.getTime() - issueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) { 
            status = 'Atrasado';
        }
    }
    return { status, balance, totalPaid: totalPaidFromPayments };
};

export const downloadJson = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            return reject(new Error("O ficheiro é demasiado grande (limite de 50MB)."));
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

export const triggerImport = (onFileSelected: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            onFileSelected(file);
        }
    };
    input.click();
};

export const exportToCsv = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) {
        return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString()
                    : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};