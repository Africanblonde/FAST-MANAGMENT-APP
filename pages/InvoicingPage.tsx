import React, { useMemo, useState } from 'react';
import type { Invoice, Expense, Permission } from '../types';
import { ICONS } from '../constants';
import { formatCurrency, getInvoiceStatusAndBalance } from '../utils/helpers';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { generateInvoicePdf } from '../services/invoicePdfService';

interface InvoicingPageProps {
    invoices: Invoice[];
    expenses: Expense[];
    onNewInvoice: () => void;
    onEditInvoice: (id: string) => void;
    onViewInvoice: (id: string, isCollection: boolean) => void;
    onDeleteInvoice: (id: string) => void;
    onNewExpense: () => void;
    onRegisterPayment: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}

const InvoicingPage: React.FC<InvoicingPageProps> = ({ 
    invoices, expenses, onNewInvoice, onEditInvoice, onViewInvoice, onDeleteInvoice, onNewExpense, onRegisterPayment, hasPermission
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Handler para baixar PDF diretamente da tabela
    const handleDownloadPdf = async (invoiceId: string) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        try {
            await generateInvoicePdf(invoice, undefined, undefined, undefined, null, false);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar PDF. Tente novamente.');
        }
    };
    
    const stats = useMemo(() => {
        const totalFaturado = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalRecebido = invoices.flatMap(inv => inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const totalEmDivida = totalFaturado - totalRecebido;
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        return {
            'Total Faturado': totalFaturado,
            'Total Recebido': totalRecebido,
            'Total em Dívida': totalEmDivida,
            'Total Despesas': totalExpenses,
        };
    }, [invoices, expenses]);

    const monthlyData = useMemo(() => {
        const dataMap: { [key: string]: { name: string, faturado: number, recebido: number } } = {};
        const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-PT', { month: 'short', year: '2-digit' });

        [...invoices].sort((a,b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()).forEach(inv => {
            const month = formatDate(inv.issueDate);
            if (!dataMap[month]) dataMap[month] = { name: month, faturado: 0, recebido: 0 };
            dataMap[month].faturado += inv.total;
        });
        
        invoices.flatMap(inv => inv.payments || []).forEach(p => {
            const month = formatDate(p.date);
            if (!dataMap[month]) dataMap[month] = { name: month, faturado: 0, recebido: 0 };
            dataMap[month].recebido += p.amount;
        });

        return Object.values(dataMap);
    }, [invoices]);
    
    const renderStatus = (status: Invoice['status']) => {
        const statusStyles: Record<string, React.CSSProperties> = {
            'Pago': { backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)' },
            'Pago Parcialmente': { backgroundColor: 'hsla(217, 91%, 60%, 0.1)', color: 'var(--color-secondary)' },
            'Pendente': { backgroundColor: 'hsla(45, 93%, 58%, 0.1)', color: 'var(--color-warning)' },
            'Atrasado': { backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--color-danger)' },
        };
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px', ...statusStyles[status] }}>{status}</span>
    }

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice => {
                const query = searchQuery.toLowerCase();
                const clientMatch = invoice.clientName.toLowerCase().includes(query);
                const idMatch = invoice.display_id?.toLowerCase().includes(query) || invoice.id.toLowerCase().includes(query);
                return !query || clientMatch || idMatch;
            })
            .filter(invoice => {
                if (!statusFilter) return true;
                const { status } = getInvoiceStatusAndBalance(invoice);
                return status === statusFilter;
            })
            .filter(invoice => {
                if (!startDate && !endDate) return true;
                const issueDate = new Date(invoice.issueDate);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);

                if (start && issueDate < start) return false;
                if (end && issueDate > end) return false;
                return true;
            })
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }, [invoices, searchQuery, statusFilter, startDate, endDate]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1>Orçamentos & Faturas</h1>
                <div className="flex gap-4 flex-wrap">
                    {hasPermission('manage_expenses') && (
                        <button onClick={onNewExpense} className="btn btn-warning">
                            {ICONS.EXPENSES} <span>Nova Despesa</span>
                        </button>
                    )}
                    {hasPermission('create_invoices') && (
                        <button onClick={onNewInvoice} className="btn btn-primary flex items-center gap-2">
                            {ICONS.INVOICES} <span>Nova Fatura</span>
                        </button>
                    )}
                </div>
            </div>

            {hasPermission('view_dashboard_financials') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(stats).map(([key, value]) => {
                        let valueColor = 'var(--color-text-primary)';
                        if (key === 'Total Recebido') valueColor = 'var(--color-success)';
                        if (key === 'Total em Dívida') valueColor = 'var(--color-danger)';
                        if (key === 'Total Despesas') valueColor = 'var(--color-warning)';
                        
                        return (
                            <div key={key} className="card" style={{padding: '1.5rem'}}>
                                <h2 style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500}}>{key}</h2>
                                <p style={{fontSize: '1.75rem', fontWeight: 700, color: valueColor}}>{formatCurrency(value)}</p>
                            </div>
                        )
                    })}
                </div>
            )}
            
            {hasPermission('view_reports') && (
                <div className="card" style={{padding: '1.5rem'}}>
                    <h2>Visão Geral Mensal</h2>
                    <div style={{width: '100%', height: '300px', marginTop: '1rem'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize="12px" />
                                <YAxis stroke="var(--color-text-tertiary)" fontSize="12px" width={80} tickFormatter={(value: number) => new Intl.NumberFormat('pt-PT', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="faturado" fill="var(--color-primary)" name="Faturado" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="recebido" fill="var(--color-secondary)" name="Recebido" radius={[4, 4, 0, 0]} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Filtrar Faturas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                        type="text"
                        placeholder="Pesquisar cliente ou nº fatura..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input lg:col-span-2"
                    />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Todos Estados</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Pago Parcialmente">Pago Parcialmente</option>
                        <option value="Pago">Pago</option>
                        <option value="Atrasado">Atrasado</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-input"
                        />
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            <div className="card table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fatura</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th style={{textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => {
                            const { status } = getInvoiceStatusAndBalance(invoice);
                            return (
                            <tr key={invoice.id}>
                                <td style={{fontFamily: 'monospace', fontSize: '0.875rem'}}>
                                    <div className="flex items-center gap-2">
                                        <span>{invoice.display_id ? invoice.display_id : (invoice.id.startsWith('offline-') || invoice.id.startsWith('draft-')) ? `...${invoice.id.slice(-6)}` : invoice.id}</span>
                                        {invoice.isOffline && <div style={{color: 'var(--color-text-tertiary)'}} title="Sincronização pendente">{ICONS.CLOCK}</div>}
                                    </div>
                                </td>
                                <td>{invoice.clientName}</td>
                                <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                <td style={{fontWeight: 600}}>{formatCurrency(invoice.total || 0)}</td>
                                <td>{renderStatus(status)}</td>
                                <td>
                                    <div className="flex gap-1 justify-end items-center">
                                        {status !== 'Pago' && hasPermission('register_payments') && 
                                            <button onClick={() => onRegisterPayment(invoice.id)} className="btn-icon" style={{color: 'var(--color-success)'}} title="Registar Pagamento">{ICONS.PAYMENT}</button>
                                        }
                                        {hasPermission('print_invoices') && (
                                            <div className="flex gap-2">
                                                <button onClick={() => onViewInvoice(invoice.id, false)} className="btn-icon" title="Pré-visualizar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </button>
                                                <button onClick={() => handleDownloadPdf(invoice.id)} className="btn-icon" title="Baixar PDF">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                </button>
                                            </div>
                                        )}
                                        {hasPermission('edit_invoices') && 
                                            <button onClick={() => onEditInvoice(invoice.id)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                        }
                                        {hasPermission('delete_invoices') && 
                                            <button onClick={() => onDeleteInvoice(invoice.id)} className="btn-icon" style={{color: 'var(--color-danger)'}} title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                        }
                                    </div>
                                </td>
                            </tr>
                        )})}
                        {filteredInvoices.length === 0 && (
                             <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem'}}>Nenhuma fatura encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicingPage;