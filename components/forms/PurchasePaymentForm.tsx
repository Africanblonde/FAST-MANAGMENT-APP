import React, { useState, useMemo } from 'react';

// --- Tipos Locais ---
type PurchasePayment = {
    id?: string; // ID local ou de base de dados
    method: string;
    amount: number;
    date: string;
    receiptNumber: string | null;
    // Omitidos: company_id, purchase_id, created_at
};

type PaymentMethod = {
    name: string;
};

type Purchase = {
    id: string;
    display_id: string;
    supplierId: string;
    totalAmount: number;
    payments: PurchasePayment[];
    // Outras propriedades irrelevantes
};

// --- Estrutura de Pagamento Local para o Estado ---
type PaymentState = {
    id: number; // Apenas para tracking no array de estado
    method: string;
    amount: string; // Mantido como string para input field
};

// --- Funções Auxiliares (Simuladas) ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amount);
};

// --- Interface de Props ---
interface PurchasePaymentFormProps {
    purchase: Purchase;
    supplierName: string; // Nome do Fornecedor para exibição
    balance: number; // O saldo em dívida (propriedade essencial)
    // O payload de salvamento é o tipo PurchasePayment sem o 'id'
    onSave: (purchaseId: string, payments: Omit<PurchasePayment, 'id'>[]) => void; 
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

// CORREÇÃO: Aplicação direta da tipagem na desestruturação das props.
const PurchasePaymentForm = ({ purchase, supplierName, onSave, onCancel, paymentMethods, balance }: PurchasePaymentFormProps) => {
    
    // Inicializa o estado com tipagem explícita e sugere o valor total da dívida
    const [payments, setPayments] = useState<PaymentState[]>([
        { 
            id: 1, 
            method: paymentMethods[0]?.name || 'Cash', 
            amount: balance > 0 ? balance.toFixed(2) : '' 
        }
    ]);
    
    const [nextId, setNextId] = useState<number>(2);
    const [receiptNumber, setReceiptNumber] = useState<string>('');

    // CORREÇÃO: Parâmetros tipados (id: number, field: literal type, value: string)
    const handlePaymentChange = (id: number, field: 'method' | 'amount', value: string) => {
        setPayments((current: PaymentState[]) => current.map((p: PaymentState) => 
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const addPayment = () => {
        setPayments((current: PaymentState[]) => [
            ...current, 
            { id: nextId, method: paymentMethods[0]?.name || 'Cash', amount: '' }
        ]);
        setNextId((prev: number) => prev + 1);
    };

    const removePayment = (id: number) => {
        if (payments.length > 1) {
            setPayments((current: PaymentState[]) => current.filter((p: PaymentState) => p.id !== id));
        }
    };

    // CORREÇÃO: 'sum' e 'p' agora tipados
    const totalPaid = useMemo(() => payments.reduce((sum: number, p: PaymentState) => sum + Number(p.amount || 0), 0), [payments]);
    const remainingBalance = balance - totalPaid;

    // Tipagem explícita para o evento do formulário
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Substituído alert() por console.error()
        if (totalPaid <= 0) {
            console.error("O valor total a pagar deve ser superior a zero.");
            return;
        }
        
        if (totalPaid > balance + 0.01) { // Tolerância para ponto flutuante
            console.error(`O valor total pago (${formatCurrency(totalPaid)}) não pode ser superior à dívida (${formatCurrency(balance)}).`);
            return;
        }
        
        // Tipagem explícita no map e filter
        const newPaymentRecords: Omit<PurchasePayment, 'id'>[] = payments
            .filter((p: PaymentState) => parseFloat(p.amount) > 0)
            .map((p: PaymentState) => ({
                amount: parseFloat(p.amount),
                method: p.method,
                date: new Date().toISOString(),
                receiptNumber: receiptNumber.trim() || null,
            }));

        onSave(purchase.id, newPaymentRecords);
    };
    
    // Classes de Dark Mode (Tailwind)
    const cardClasses = "bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl";
    const headerClasses = "text-xl font-bold text-slate-100 mb-4";
    const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out shadow-sm";
    const selectClasses = inputClasses.replace('shadow-sm', 'shadow-sm appearance-none');

    // Usar tons de vermelho/laranja para pagamentos de compra/despesa (saída de dinheiro)
    const primaryColor = 'red'; 
    const primaryClasses = `bg-${primaryColor}-600 hover:bg-${primaryColor}-700`;
    const textPrimaryClasses = `text-${primaryColor}-400`;

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 text-slate-100 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Coluna da Esquerda: Resumo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={cardClasses}>
                        <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Detalhes da Compra</h3></div>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Nº Compra:</span> <span className="font-semibold">#{purchase.display_id || `...${purchase.id.slice(-6)}`}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Fornecedor:</span> <span className="font-semibold">{supplierName}</span></div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-slate-400 text-sm">Valor em Dívida</p>
                                <p className={`text-3xl font-bold ${textPrimaryClasses}`}>{formatCurrency(balance)}</p>
                            </div>
                        </div>
                    </div>
                    {totalPaid > 0 && (
                        <div className={cardClasses}>
                            <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Resumo do Pagamento</h3></div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline"><span className="text-slate-400">Total a Pagar:</span> <span className={`text-xl font-bold ${textPrimaryClasses}`}>{formatCurrency(totalPaid)}</span></div>
                                <div className="flex justify-between items-baseline"><span className="text-slate-400">Dívida Restante:</span> <span className={`text-xl font-bold ${remainingBalance <= 0.01 ? textPrimaryClasses : 'text-yellow-400'}`}>{formatCurrency(Math.max(0, remainingBalance))}</span></div>
                                {remainingBalance <= 0.01 ? (
                                    <div className={`p-2 bg-${primaryColor}-900/30 text-center rounded-md text-sm ${textPrimaryClasses.replace('400', '300')}`}>✅ Compra será liquidada.</div>
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
                        <div className="border-b border-slate-700 mb-4 pb-2"><h3 className={headerClasses.replace('mb-4', 'mb-0')}>Dados do Pagamento (Saída)</h3></div>
                        <div className="space-y-4">
                            {payments.map((p: PaymentState) => ( // p tipado
                                <div key={p.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Método de Pagamento</label>
                                        <select 
                                            value={p.method} 
                                            // Tipagem explícita para o evento de select
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePaymentChange(p.id, 'method', e.target.value)} 
                                            className={selectClasses}
                                        >
                                            {paymentMethods.map((pm: PaymentMethod) => <option key={pm.name} value={pm.name}>{pm.name}</option>)} {/* pm tipado */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Valor a Pagar</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                value={p.amount} 
                                                // Tipagem explícita para o evento de input
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
                            <button type="button" onClick={addPayment} className={`w-full py-2 px-4 border-2 border-dashed border-slate-600 hover:border-${primaryColor}-500 text-slate-400 hover:text-${primaryColor}-400 rounded-lg transition-colors flex items-center justify-center gap-2`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Adicionar Outro Pagamento
                            </button>
                            <div className="pt-4 border-t border-slate-700">
                                <label htmlFor="receiptNumber" className="block text-sm font-medium text-slate-300 mb-1">Número do Recibo/Comprovativo (Opcional)</label>
                                <input id="receiptNumber" type="text" value={receiptNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptNumber(e.target.value)} placeholder="Ex: Referência da Transação" className={inputClasses}/>
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
                    className={`px-4 py-2 text-white font-semibold rounded-lg ${primaryClasses} transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Confirmar Pagamento
                </button>
            </div>
        </form>
    );
};

export default PurchasePaymentForm;