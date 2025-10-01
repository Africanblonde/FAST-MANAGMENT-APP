import React, { useState, useMemo } from 'react';
import type { Invoice, Expense, Client, Supplier, InvoicePayment } from '../types';
import { formatCurrency } from '../utils/helpers';

interface StatementPageProps {
    invoices: Invoice[];
    clients: Client[];
    suppliers: Supplier[];
    expenses: Expense[];
}

interface StatementItem {
    date: string;
    description: string;
    credit: number;
    debit: number;
    type: 'credit' | 'debit';
}

// Removido React.FC e tipado diretamente
const StatementPage = ({ invoices, clients, suppliers, expenses }: StatementPageProps) => {

    const [filterType, setFilterType] = useState('all');
    const [selectedId, setSelectedId] = useState('');
    
    const statementItems = useMemo(() => {
        const items: StatementItem[] = [];

        // Credits (Invoice Payments)
        invoices.forEach((inv: Invoice) => {
            if (filterType === 'client' && inv.clientId !== selectedId) return;
            (inv.payments || []).forEach((p: InvoicePayment) => {
                items.push({
                    date: p.date,
                    description: `Pagamento Fatura #${inv.display_id || inv.id} (${inv.clientName})`,
                    credit: p.amount,
                    debit: 0,
                    type: 'credit'
                });
            });
        });

        // Debits (Expenses)
        expenses.forEach((exp: Expense) => {
             if (filterType === 'client') return; // Expenses not tied to clients for now
             if (filterType === 'supplier' && exp.supplierId !== selectedId) return;

            items.push({
                date: exp.date,
                description: exp.description,
                credit: 0,
                debit: exp.amount,
                type: 'debit'
            });
        });

        return items.sort((a: StatementItem, b: StatementItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, expenses, filterType, selectedId]);
    
    const { finalBalance, totalCredit, totalDebit } = useMemo(() => {
         const totalCredit = statementItems.reduce((sum: number, item: StatementItem) => sum + item.credit, 0);
         const totalDebit = statementItems.reduce((sum: number, item: StatementItem) => sum + item.debit, 0);
         return { totalCredit, totalDebit, finalBalance: totalCredit - totalDebit };
    }, [statementItems]);
    
    const handlePrint = () => {
        document.body.classList.add('is-printing-statement');
        window.print();
        document.body.classList.remove('is-printing-statement');
    }

    return (
        <div className="space-y-8 statement-page">
            <div className="no-print flex flex-wrap justify-between items-center gap-4">
                 <h1 className="section-title">Extrato de Conta</h1>
                 <button onClick={handlePrint} className="btn btn-primary">Imprimir</button>
            </div>
            
             <div className="no-print card">
                <div className="card-body">
                    <div className="flex flex-wrap items-center gap-4">
                        <select value={filterType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFilterType(e.target.value); setSelectedId(''); }} className="form-select">
                            <option value="all">Geral</option>
                            <option value="client">Por Cliente</option>
                            <option value="supplier">Por Fornecedor</option>
                        </select>
                {filterType === 'client' && (
                    <select value={selectedId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(e.target.value)} className="form-select">
                        <option value="">Selecione um cliente</option>
                        {clients.map((c: Client) => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
                    </select>
                )}
                 {filterType === 'supplier' && (
                    <select value={selectedId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(e.target.value)} className="form-select">
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    )}
                    </div>
                </div>
            </div>

            <div className="table-wrapper statement-table-container">
                <div className="overflow-x-auto">
                    <table className="table statement-table">
                        <thead>
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 text-right">Débito</th>
                                <th className="p-4 text-right">Crédito</th>
                            </tr>
                        </thead>
                        <tbody>
                             {statementItems.map((item: StatementItem, index: number) => (
                                <tr key={index}>
                                    <td className="p-4">{new Date(item.date).toLocaleDateString()}</td>
                                    <td className="p-4">{item.description}</td>
                                    <td className={`p-4 text-right font-semibold ${item.debit > 0 ? 'text-red-500' : 'text-slate-500'}`}>{formatCurrency(item.debit)}</td>
                                    <td className={`p-4 text-right font-semibold ${item.credit > 0 ? 'text-green-400' : 'text-slate-500'}`}>{formatCurrency(item.credit)}</td>
                                </tr>
                             ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-600 font-bold">
                             <tr>
                                <td colSpan={2} className="p-4 text-right">Totais:</td>
                                <td className="p-4 text-right text-red-500">{formatCurrency(totalDebit)}</td>
                                <td className="p-4 text-right text-green-400">{formatCurrency(totalCredit)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="p-4 text-right text-lg">Saldo Final:</td>
                                <td className={`p-4 text-right text-lg ${finalBalance < 0 ? 'text-red-500' : 'text-green-400'}`}>{formatCurrency(finalBalance)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    {statementItems.length === 0 && <p style={{color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem'}}>Nenhum movimento encontrado para o filtro selecionado.</p>}
                </div>
            </div>
        </div>
    );
};

export default StatementPage;