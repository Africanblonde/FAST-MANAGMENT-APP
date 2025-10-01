import React, { useMemo, useState } from 'react';
import type { ExtraReceipt, Invoice, InvoicePayment, PaymentMethod, Expense } from '../types';
import { formatCurrency } from '../utils/helpers';
import { useCurrency } from '../contexts/CurrencyContext';
import Modal from '../components/Modal';
import { ICONS } from '../constants';

// Formulário para Receitas Extras
export const ExtraReceiptForm: React.FC<{ 
    item: Partial<ExtraReceipt>, 
    onSave: (receipt: Partial<ExtraReceipt>) => void, 
    onCancel: () => void, 
    paymentMethods: string[] 
}> = ({ item, onSave, onCancel, paymentMethods }) => {
    const [receipt, setReceipt] = useState({
        description: item.description || '',
        amount: item.amount || 0,
        date: (item.date || new Date().toISOString()).split('T')[0],
        paymentMethod: item.paymentMethod || paymentMethods[0] || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...item, ...receipt, date: new Date(receipt.date).toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="description" value={receipt.description} onChange={(e) => setReceipt(r => ({ ...r, description: e.target.value }))} placeholder="Descrição da Receita" required className="form-input" />
            <input name="amount" type="number" step="0.01" value={receipt.amount || ''} onChange={(e) => setReceipt(r => ({ ...r, amount: parseFloat(e.target.value) || 0 }))} placeholder="Valor (MT)" required className="form-input" />
            <select name="paymentMethod" value={receipt.paymentMethod} onChange={(e) => setReceipt(r => ({ ...r, paymentMethod: e.target.value }))} required className="form-select">
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="date" name="date" value={receipt.date} onChange={(e) => setReceipt(r => ({ ...r, date: e.target.value }))} required className="form-input" />
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};


const RecebimentosPage: React.FC<{
    invoices: Invoice[],
    extraReceipts: ExtraReceipt[],
    expenses: Expense[],
    paymentMethods: PaymentMethod[],
    onAddExtraReceipt: (receipt: Partial<ExtraReceipt>) => void,
    onEditExtraReceipt: (receipt: Partial<ExtraReceipt>) => void,
    onDeleteExtraReceipt: (id: string) => void,
    onViewInvoice: (id: string, isCollection: boolean) => void;
    onDeleteInvoicePayment: (paymentId: string, invoiceId: string) => void;
    onOpenEditPaymentModal: (payment: InvoicePayment) => void;
}> = ({ invoices, extraReceipts, expenses, paymentMethods, onAddExtraReceipt, onEditExtraReceipt, onDeleteExtraReceipt, onViewInvoice, onDeleteInvoicePayment, onOpenEditPaymentModal }) => {

    const { currency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReceipt, setEditingReceipt] = useState<Partial<ExtraReceipt> | null>(null);

    const handleOpenModal = (receipt: Partial<ExtraReceipt> | null = null) => {
        setEditingReceipt(receipt || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReceipt(null);
    };

    const handleSaveReceipt = (receipt: Partial<ExtraReceipt>) => {
        if (receipt.id) {
            onEditExtraReceipt(receipt);
        } else {
            onAddExtraReceipt(receipt);
        }
        handleCloseModal();
    };


    const allPayments = useMemo(() => {
        const invoicePayments = invoices.flatMap(inv => 
            (inv.payments || []).map(p => ({
                id: `${inv.id}-${p.id}`,
                type: 'Fatura',
                date: p.date,
                description: `Pagamento Fatura #${inv.display_id || inv.id}`,
                subDescription: inv.clientName,
                amount: p.amount,
                method: p.method,
                raw: p,
                invoiceId: inv.id
            }))
        );
        const otherReceipts = extraReceipts.map(r => ({
            id: r.id,
            type: 'Extra',
            date: r.date,
            description: r.description,
            subDescription: `Receita Diversa`,
            amount: r.amount,
            method: r.paymentMethod,
            raw: r,
            invoiceId: null
        }));

        return [...invoicePayments, ...otherReceipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, extraReceipts]);


    const dashboardBalances = useMemo(() => {
        const balanceMap = new Map<string, number>();
        paymentMethods.forEach(pm => balanceMap.set(pm.name, pm.initialBalance));

        allPayments.forEach(p => {
            if (balanceMap.has(p.method)) {
                balanceMap.set(p.method, balanceMap.get(p.method)! + p.amount);
            } else if (p.method) {
                balanceMap.set(p.method, p.amount);
            }
        });

        expenses.forEach(e => {
            if(balanceMap.has(e.paymentMethod)) {
                balanceMap.set(e.paymentMethod, balanceMap.get(e.paymentMethod)! - e.amount);
            } else if (e.paymentMethod) {
                balanceMap.set(e.paymentMethod, -e.amount);
            }
        });
        
        return Array.from(balanceMap.entries()).map(([name, balance]) => ({ name, balance }));
    }, [paymentMethods, allPayments, expenses]);

    const positiveColors = {
        bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
        border: 'rgba(34, 197, 94, 0.3)',
        icon: 'rgba(34, 197, 94, 1)',
        text: 'rgb(34, 197, 94)'
    };
    const negativeColors = {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: 'rgba(239, 68, 68, 0.3)',
        icon: 'rgba(239, 68, 68, 1)',
        text: 'rgb(239, 68, 68)'
    };
    const neutralColors = {
        bg: 'linear-gradient(135deg, hsla(220, 26%, 18%, 0.7), hsla(220, 26%, 15%, 0.7))',
        border: 'var(--color-border)',
        icon: 'var(--color-text-secondary)',
        text: 'var(--color-text-primary)'
    };


    return (
         <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1>Recebimentos & Saldos</h1>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">Adicionar Receita Extra</button>
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-6">Saldos Atuais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dashboardBalances.map(({name, balance}) => {
                        let colors;
                        if (balance > 0.01) {
                            colors = positiveColors;
                        } else if (balance < -0.01) {
                            colors = negativeColors;
                        } else {
                            colors = neutralColors;
                        }
                        
                        const maxAbsBalance = Math.max(1, ...dashboardBalances.map(b => Math.abs(b.balance)));
                        const widthPercentage = (Math.abs(balance) / maxAbsBalance) * 100;
                        
                        return (
                            <div 
                                key={name} 
                                className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <div 
                                    className="absolute top-0 right-0 w-20 h-20 opacity-20"
                                    style={{
                                        background: `radial-gradient(circle, ${colors.icon} 0%, transparent 70%)`
                                    }}
                                />
                                
                                <div className="relative p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div 
                                            className="p-3 rounded-xl"
                                            style={{
                                                backgroundColor: `${colors.icon}20`,
                                                color: colors.icon
                                            }}
                                        >
                                            {ICONS.PAYMENT}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                                            {name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: colors.text }}>
                                                {formatCurrency(Math.abs(balance)).split(' ')[0]}
                                            </span>
                                            <span className="text-sm font-medium text-slate-400">{currency.symbol}</span>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                                                <div 
                                                    className="h-1.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        background: `linear-gradient(90deg, ${colors.icon}80, ${colors.icon})`,
                                                        width: `${Math.min(widthPercentage, 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}></th>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Método</th>
                                <th className="text-right">Valor</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPayments.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.type === 'Fatura' ? 'bg-[hsla(180,100%,40%,0.1)] text-[var(--color-secondary)]' : 'bg-[hsla(139,60%,55%,0.1)] text-[var(--color-success)]'}`}>
                                           {p.type === 'Fatura' ? ICONS.INVOICES : ICONS.EXTRA_RECEIPTS}
                                        </div>
                                    </td>
                                    <td>{new Date(p.date).toLocaleDateString()}</td>
                                    <td>
                                        <p className="font-semibold text-white">{p.description}</p>
                                        <p className="text-sm text-slate-400">{p.subDescription}</p>
                                    </td>
                                    <td><span className="text-xs font-medium bg-slate-700 px-2 py-1 rounded-full">{p.method}</span></td>
                                    <td className="text-right font-semibold text-[var(--color-success)]">{formatCurrency(p.amount)}</td>
                                    <td>
                                        <div className="flex justify-end items-center gap-1">
                                            {p.type === 'Extra' ? (
                                                 <div className="flex gap-1">
                                                    <button onClick={() => handleOpenModal(p.raw as ExtraReceipt)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                                    <button onClick={() => onDeleteExtraReceipt(p.id)} className="btn-icon text-red-500" title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                                </div>
                                            ) : p.invoiceId && (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => onOpenEditPaymentModal(p.raw as InvoicePayment)} className="btn-icon" title="Editar Pagamento"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                                    <button onClick={() => onViewInvoice(p.invoiceId!, true)} className="btn-icon text-blue-400" title="Ver Fatura"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                                    <button onClick={() => onDeleteInvoicePayment((p.raw as InvoicePayment).id, p.invoiceId!)} className="btn-icon text-red-500" title="Apagar Pagamento"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {allPayments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-slate-400">Nenhum recebimento encontrado.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingReceipt?.id ? 'Editar Receita' : 'Adicionar Receita'}>
                {editingReceipt && <ExtraReceiptForm item={editingReceipt} onSave={handleSaveReceipt} onCancel={handleCloseModal} paymentMethods={paymentMethods.map(pm => pm.name)} />}
            </Modal>
        </div>
    );
};

export default RecebimentosPage;