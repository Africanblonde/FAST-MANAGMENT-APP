import React, { useState, useMemo } from 'react';

// --- Tipos Locais (Substituindo '../../types' e garantindo autonomia) ---
type InvoicePayment = {
    id?: string; // Usado localmente para tracking de UI
    method: string;
    amount: number;
    date: string;
    receiptNumber: string | null;
    // Omitidos: company_id, invoice_id, created_at
};

type PaymentMethod = {
    name: string;
};

type Invoice = {
    id: string;
    display_id: string;
    clientName: string;
    totalAmount: number;
    payments: InvoicePayment[];
    // Outras propriedades irrelevantes
};

// --- Estrutura de Pagamento Local para o Estado (State) ---
type PaymentState = {
    id: number; // Apenas para tracking no array de estado
    method: string;
    amount: string; // Mantido como string para input field
};

// --- Simulação de Helpers e Constantes (Substituindo '../../utils/helpers' e '../../constants') ---
const ICONS = {
    USER_PLUS: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
    ),
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amount);
};

const getInvoiceStatusAndBalance = (invoice: Invoice) => {
    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const balance = invoice.totalAmount - totalPaid;
    return { balance: balance, status: balance <= 0 ? 'PAID' : 'PENDING' };
};

// --- Interface de Props ---
interface PaymentFormProps {
    invoice: Invoice;
    // Omit<InvoicePayment, 'id'> é o tipo correto para o payload de salvamento
    onSave: (invoiceId: string, payments: Omit<InvoicePayment, 'id'>[]) => void; 
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

// CORREÇÃO: Aplicação direta da tipagem na desestruturação das props.
const PaymentForm = ({ invoice, onSave, onCancel, paymentMethods }: PaymentFormProps) => {
    const { balance } = getInvoiceStatusAndBalance(invoice);
    
    // Inicializa o estado com tipagem explícita (PaymentState[])
    const [payments, setPayments] = useState<PaymentState[]>([
        { 
            id: 1, 
            method: paymentMethods[0]?.name || 'Cash', 
            amount: balance > 0 ? balance.toFixed(2) : '' 
        }
    ]);
    
    const [nextId, setNextId] = useState<number>(2); // Tipado
    const [receiptNumber, setReceiptNumber] = useState<string>(''); // Tipado

    // CORREÇÃO: Parâmetros tipados
    const handlePaymentChange = (id: number, field: 'method' | 'amount', value: string) => {
        // CORREÇÃO: 'current' tipado via PaymentState[]
        setPayments((current: PaymentState[]) => current.map((p: PaymentState) => // CORREÇÃO: 'p' tipado
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    // CORREÇÃO: 'current' tipado
    const addPayment = () => {
        setPayments((current: PaymentState[]) => [
            ...current, 
            { id: nextId, method: paymentMethods[0]?.name || 'Cash', amount: '' }
        ]);
        // CORREÇÃO: 'prev' tipado
        setNextId((prev: number) => prev + 1);
    };

    // CORREÇÃO: 'current' tipado via PaymentState[]
    const removePayment = (id: number) => {
        if (payments.length > 1) {
            setPayments((current: PaymentState[]) => current.filter((p: PaymentState) => p.id !== id)); // CORREÇÃO: 'p' tipado
        }
    };

    // CORREÇÃO: 'sum' e 'p' agora tipados
    const totalPaid = useMemo(() => payments.reduce((sum: number, p: PaymentState) => sum + Number(p.amount || 0), 0), [payments]);
    const remainingBalance = balance - totalPaid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Substituído alert() por console.error()
        if (totalPaid <= 0) {
            console.error("O valor total a pagar deve ser superior a zero.");
            return;
        }
        
        if (totalPaid > balance + 0.01) { // Add tolerance for floating point issues
            // Substituído alert() por console.error()
            console.error(`O valor total a pagar (${formatCurrency(totalPaid)}) não pode ser superior à dívida (${formatCurrency(balance)}).`);
            return;
        }
        
        // Tipagem explícita para os arrays no map e filter
        const newPaymentRecords: Omit<InvoicePayment, 'id'>[] = payments
            .filter((p: PaymentState) => parseFloat(p.amount) > 0)
            .map((p: PaymentState) => ({
                amount: parseFloat(p.amount),
                method: p.method,
                date: new Date().toISOString(),
                receiptNumber: receiptNumber.trim() || null,
            }));

        onSave(invoice.id, newPaymentRecords);
    };
    
    // Classes de Dark Mode (Tailwind)
    const cardClasses = "bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl";
    const headerClasses = "text-xl font-bold text-slate-100 mb-4";
    const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm";
    const selectClasses = inputClasses.replace('shadow-sm', 'shadow-sm appearance-none');

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 text-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Coluna da Esquerda: Resumo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={cardClasses}>
                        <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Detalhes da Fatura</h3></div>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Nº Fatura:</span> <span className="font-semibold">#{invoice.display_id || `...${invoice.id.slice(-6)}`}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Cliente:</span> <span className="font-semibold">{invoice.clientName}</span></div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-slate-400 text-sm">Valor em Dívida</p>
                                <p className="text-3xl font-bold text-red-400">{formatCurrency(balance)}</p>
                            </div>
                        </div>
                    </div>
                    {totalPaid > 0 && (
                        <div className={cardClasses}>
                            <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Resumo do Pagamento</h3></div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline"><span className="text-slate-400">Total a Pagar:</span> <span className="text-xl font-bold text-green-400">{formatCurrency(totalPaid)}</span></div>
                                <div className="flex justify-between items-baseline"><span className="text-slate-400">Dívida Restante:</span> <span className={`text-xl font-bold ${remainingBalance <= 0.01 ? 'text-green-400' : 'text-yellow-400'}`}>{formatCurrency(Math.max(0, remainingBalance))}</span></div>
                                {remainingBalance <= 0.01 ? (
                                    <div className="p-2 bg-green-900/30 text-center rounded-md text-sm text-green-400">✅ Fatura será liquidada.</div>
                                ) : (
                                    <div className="p-2 bg-yellow-900/30 text-center rounded-md text-sm text-yellow-400">⚠️ Pagamento parcial.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna da Direita: Inputs */}
                <div className="lg:col-span-3">
                    <div className={cardClasses}>
                        <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Dados do Pagamento</h3></div>
                        <div className="space-y-4">
                            {payments.map((p: PaymentState) => (
                                <div key={p.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Método de Pagamento</label>
                                        <select 
                                            value={p.method} 
                                            // Tipagem explícita para o evento de mudança de select
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePaymentChange(p.id, 'method', e.target.value)} 
                                            className={selectClasses}
                                        >
                                            {paymentMethods.map((pm: PaymentMethod) => <option key={pm.name} value={pm.name}>{pm.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Valor a Pagar</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                value={p.amount} 
                                                // Tipagem explícita para o evento de mudança de input
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePaymentChange(p.id, 'amount', e.target.value)} 
                                                placeholder="0.00" 
                                                className={`${inputClasses} pr-12`}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">MT</span>
                                        </div>
                                    </div>
                                    {payments.length > 1 && (
                                        <div className="md:col-span-3 flex justify-end">
                                            <button type="button" onClick={() => removePayment(p.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                Remover
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addPayment} className="w-full py-2 px-4 border-2 border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2">
                                {ICONS.USER_PLUS} Adicionar Outro Pagamento
                            </button>
                            <div className="pt-4 border-t border-slate-700">
                                <label htmlFor="receiptNumber" className="block text-sm font-medium text-slate-300 mb-1">Número do Recibo (Opcional)</label>
                                {/* Tipagem explícita para o evento de mudança de input */}
                                <input id="receiptNumber" type="text" value={receiptNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptNumber(e.target.value)} placeholder="Ex: 2024001" className={inputClasses}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-300 font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition duration-150">Cancelar</button>
                <button 
                    type="submit" 
                    disabled={totalPaid <= 0 || totalPaid > balance + 0.01} 
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirmar Pagamento
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
