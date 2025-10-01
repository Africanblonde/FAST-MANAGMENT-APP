import React, { useState, useMemo } from 'react';
import type { Invoice, InvoicePayment, PaymentMethod } from '../../types';
import { getInvoiceStatusAndBalance, formatCurrency } from '../../utils/helpers';
import { ICONS } from '../../constants';

interface PaymentFormProps {
    invoice: Invoice;
    onSave: (invoiceId: string, payments: Omit<InvoicePayment, 'id'|'company_id'|'invoice_id'|'created_at'>[]) => void;
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

interface PaymentState {
    id: number;
    method: string;
    amount: string;
}

// Use função regular com props tipadas explicitamente
const PaymentForm = (props: PaymentFormProps) => {
    const { invoice, onSave, onCancel, paymentMethods } = props;
    const { balance } = getInvoiceStatusAndBalance(invoice);
    const [payments, setPayments] = useState<PaymentState[]>([
        { 
            id: 1, 
            method: paymentMethods[0]?.name || '', 
            amount: balance > 0 ? balance.toFixed(2) : '' 
        }
    ]);
    const [nextId, setNextId] = useState(2);
    const [receiptNumber, setReceiptNumber] = useState('');

    const handlePaymentChange = (id: number, field: 'method' | 'amount', value: string) => {
        setPayments((current: PaymentState[]) => 
            current.map((p: PaymentState) => 
                p.id === id ? { ...p, [field]: value } : p
            )
        );
    };

    const addPayment = () => {
        setPayments((current: PaymentState[]) => [
            ...current, 
            { 
                id: nextId, 
                method: paymentMethods[0]?.name || '', 
                amount: '' 
            }
        ]);
        setNextId((prev: number) => prev + 1);
    };

    const removePayment = (id: number) => {
        if (payments.length > 1) {
            setPayments((current: PaymentState[]) => current.filter((p: PaymentState) => p.id !== id));
        }
    };

    const totalPaid = useMemo(() => 
        payments.reduce((sum: number, p: PaymentState) => sum + Number(p.amount || 0), 0), 
        [payments]
    );
    const remainingBalance = balance - totalPaid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (totalPaid <= 0) {
            alert("O valor total a pagar deve ser superior a zero.");
            return;
        }
        if (totalPaid > balance + 0.01) { // Add tolerance for floating point issues
            alert(`O valor total a pagar (${formatCurrency(totalPaid)}) não pode ser superior à dívida (${formatCurrency(balance)}).`);
            return;
        }
        const newPaymentRecords: Omit<InvoicePayment, 'id'|'company_id'|'invoice_id'|'created_at'>[] = payments
            .filter((p: PaymentState) => parseFloat(p.amount) > 0)
            .map((p: PaymentState) => ({
                amount: parseFloat(p.amount),
                method: p.method,
                date: new Date().toISOString(),
                receiptNumber: receiptNumber.trim() || null,
            }));

        onSave(invoice.id, newPaymentRecords);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Coluna da Esquerda: Resumo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="card-header border-b border-slate-700"><h3>Detalhes da Fatura</h3></div>
                        <div className="card-body space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Nº Fatura:</span> <span className="font-semibold">#{invoice.display_id || `...${invoice.id.slice(-6)}`}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Cliente:</span> <span className="font-semibold">{invoice.clientName}</span></div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-slate-400 text-sm">Valor em Dívida</p>
                                <p className="text-3xl font-bold text-red-400">{formatCurrency(balance)}</p>
                            </div>
                        </div>
                    </div>
                    {totalPaid > 0 && (
                        <div className="card">
                            <div className="card-header border-b border-slate-700"><h3>Resumo do Pagamento</h3></div>
                            <div className="card-body space-y-3">
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
                <div className="lg:col-span-3 card">
                     <div className="card-header border-b border-slate-700"><h3>Dados do Pagamento</h3></div>
                     <div className="card-body space-y-4">
                        {payments.map((p: PaymentState) => (
                            <div key={p.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Método de Pagamento</label>
                                    <select 
                                        value={p.method} 
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePaymentChange(p.id, 'method', e.target.value)} 
                                        className="form-select"
                                    >
                                        {paymentMethods.map((pm: PaymentMethod) => (
                                            <option key={pm.name} value={pm.name}>{pm.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Valor a Pagar</label>
                                    <div className="relative">
                                         <input 
                                            type="number" 
                                            step="0.01" 
                                            value={p.amount} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePaymentChange(p.id, 'amount', e.target.value)} 
                                            placeholder="0.00" 
                                            className="form-input pr-12"
                                        />
                                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">MT</span>
                                    </div>
                                </div>
                                {payments.length > 1 && (
                                    <div className="md:col-span-3 flex justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => removePayment(p.id)} 
                                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            Remover
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addPayment} 
                            className="w-full py-2 px-4 border-2 border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {ICONS.USER_PLUS} Adicionar Outro Pagamento
                        </button>
                        <div className="pt-4 border-t border-slate-700">
                            <label htmlFor="receiptNumber" className="block text-sm font-medium text-slate-300 mb-1">Número do Recibo (Opcional)</label>
                            <input 
                                id="receiptNumber" 
                                type="text" 
                                value={receiptNumber} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptNumber(e.target.value)} 
                                placeholder="Ex: 2024001" 
                                className="form-input"
                            />
                        </div>
                     </div>
                </div>
            </div>

            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" disabled={totalPaid <= 0 || totalPaid > balance + 0.01} className="btn btn-primary">
                    Confirmar Pagamento
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
