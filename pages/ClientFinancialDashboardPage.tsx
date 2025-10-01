import React, { useState, useMemo, ChangeEvent } from 'react';
import type { Client, Invoice, PaymentMethod, InvoiceStatus } from '../types';
import { formatCurrency, getInvoiceStatusAndBalance, exportToCsv } from '../utils/helpers';
import { ICONS } from '../constants';

type SortConfig = {
    key: keyof FormattedInvoice;
    direction: 'ascending' | 'descending';
};

type FormattedInvoice = {
    date: string;
    docNumber: string;
    type: 'Fatura';
    description: string;
    total: number;
    paid: number;
    balance: number;
    status: InvoiceStatus;
    raw: Invoice;
};

interface StatusBadgeProps {
    status: InvoiceStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }: StatusBadgeProps) => {
    const statusStyles: Record<InvoiceStatus, React.CSSProperties> = {
        'Pago': { backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)' },
        'Pago Parcialmente': { backgroundColor: 'hsla(217, 91%, 60%, 0.1)', color: 'var(--color-secondary)' },
        'Pendente': { backgroundColor: 'hsla(45, 93%, 58%, 0.1)', color: 'var(--color-warning)' },
        'Atrasado': { backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--color-danger)' },
        'Anulada': { backgroundColor: 'hsla(215, 16%, 55%, 0.1)', color: 'var(--color-text-tertiary)' },
    };
    
    const style = statusStyles[status] || {};
    
    return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', ...style }}>{status}</span>;
};

interface ClientFinancialDashboardPageProps {
    client: Client;
    allInvoices: Invoice[];
    paymentMethods: PaymentMethod[];
    onClose: () => void;
    onRegisterPayment: (invoiceId: string) => void;
    onViewInvoice: (invoiceId: string, isCollection: boolean) => void;
}

const ClientFinancialDashboardPage: React.FC<ClientFinancialDashboardPageProps> = (props: ClientFinancialDashboardPageProps) => {
    const { 
        client, 
        allInvoices, 
        onClose, 
        onRegisterPayment, 
        onViewInvoice 
    } = props;
    
    const [filters, setFilters] = useState({ 
        startDate: '', 
        endDate: '', 
        status: '', 
        searchQuery: '' 
    });
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });

    const clientInvoices = useMemo(
        () => allInvoices
            .filter((inv: Invoice) => inv.clientId === client.id)
            .map((inv: Invoice) => {
                const { status, balance, totalPaid } = getInvoiceStatusAndBalance(inv);
                const description = inv.items.map((i: any) => i.description).join(', ') || 'Fatura de serviços/peças';
                return {
                    date: inv.issueDate,
                    docNumber: inv.display_id || `...${inv.id.slice(-6)}`,
                    type: 'Fatura' as const,
                    description: description,
                    total: inv.total,
                    paid: totalPaid,
                    balance: balance,
                    status: status,
                    raw: inv,
                };
            }),
        [allInvoices, client.id]
    );

    const summaryStats = useMemo(() => {
        const totalFaturado = clientInvoices.reduce((sum: number, inv: FormattedInvoice) => sum + inv.total, 0);
        const totalRecebido = clientInvoices.reduce((sum: number, inv: FormattedInvoice) => sum + inv.paid, 0);
        return {
            totalFaturado,
            totalRecebido,
            saldoEmDivida: totalFaturado - totalRecebido,
        };
    }, [clientInvoices]);

    const processedInvoices = useMemo(() => {
        let filtered = [...clientInvoices];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((inv: FormattedInvoice) => 
                inv.docNumber.toLowerCase().includes(query) || 
                inv.description.toLowerCase().includes(query)
            );
        }

        if (filters.status) {
            filtered = filtered.filter((inv: FormattedInvoice) => inv.status === filters.status);
        }
        
        if (filters.startDate) {
            filtered = filtered.filter((inv: FormattedInvoice) => new Date(inv.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((inv: FormattedInvoice) => new Date(inv.date) <= endDate);
        }

        filtered.sort((a: FormattedInvoice, b: FormattedInvoice) => {
            // Função auxiliar para obter valor de forma type-safe
            const getValue = (item: FormattedInvoice, key: keyof FormattedInvoice): string | number => {
                return item[key] as string | number;
            };
        
            const aValue = getValue(a, sortConfig.key);
            const bValue = getValue(b, sortConfig.key);
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [clientInvoices, filters, sortConfig]);

    const handleSort = (key: keyof FormattedInvoice) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const dataToExport = processedInvoices.map((inv: FormattedInvoice) => ({
            'Data': new Date(inv.date).toLocaleDateString(),
            'Nº Documento': inv.docNumber,
            'Tipo': inv.type,
            'Descrição': inv.description,
            'Valor Total': inv.total,
            'Valor Pago': inv.paid,
            'Saldo Devedor': inv.balance,
            'Estado': inv.status,
        }));
        exportToCsv(`historico_financeiro_${client.firstName}_${client.lastName}.csv`, dataToExport);
    };

    const tableHeaders: { key: keyof FormattedInvoice, label: string, isNumeric?: boolean }[] = [
        { key: 'date', label: 'Data' },
        { key: 'docNumber', label: 'Nº Documento' },
        { key: 'type', label: 'Tipo' },
        { key: 'description', label: 'Descrição' },
        { key: 'total', label: 'Valor Total', isNumeric: true },
        { key: 'paid', label: 'Valor Pago', isNumeric: true },
        { key: 'balance', label: 'Saldo Devedor', isNumeric: true },
        { key: 'status', label: 'Estado' },
    ];

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters((f: any) => ({...f, searchQuery: e.target.value}));
    };

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFilters((f: any) => ({...f, status: e.target.value}));
    };

    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters((f: any) => ({...f, startDate: e.target.value}));
    };

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters((f: any) => ({...f, endDate: e.target.value}));
    };
    
    return (
        <div className="fixed inset-0 bg-background z-40 flex flex-col p-4 sm:p-6 lg:p-8 animate-fade-in">
            <header className="flex-shrink-0 flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Histórico Financeiro</h1>
                    <p className="text-lg text-text-secondary">{`${client.firstName} ${client.lastName}`.trim()}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleExport} className="btn btn-ghost">{ICONS.DOWNLOAD} Exportar CSV</button>
                    <button onClick={onClose} className="btn-icon text-2xl" aria-label="Fechar">&times;</button>
                </div>
            </header>

            <section className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card p-4"><h2 className="text-text-secondary text-sm">Total Faturado</h2><p className="text-2xl font-bold">{formatCurrency(summaryStats.totalFaturado)}</p></div>
                <div className="card p-4"><h2 className="text-text-secondary text-sm">Total Recebido</h2><p className="text-2xl font-bold text-success">{formatCurrency(summaryStats.totalRecebido)}</p></div>
                <div className="card p-4"><h2 className="text-text-secondary text-sm">Saldo em Dívida</h2><p className={`text-2xl font-bold ${summaryStats.saldoEmDivida > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(summaryStats.saldoEmDivida)}</p></div>
            </section>
            
            <section className="card flex-shrink-0 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" placeholder="Pesquisar..." value={filters.searchQuery} onChange={handleSearchChange} className="form-input" />
                    <select value={filters.status} onChange={handleStatusChange} className="form-select">
                        <option value="">Todos Estados</option>
                        <option value="Paga">Paga</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Atrasado">Atrasada</option>
                        <option value="Pago Parcialmente">Pago Parcialmente</option>
                    </select>
                    <input type="date" value={filters.startDate} onChange={handleStartDateChange} className="form-input" />
                    <input type="date" value={filters.endDate} onChange={handleEndDateChange} className="form-input" />
                </div>
            </section>

            <main className="flex-grow card table-wrapper overflow-auto">
                <table className="table">
                    <thead>
                        <tr>
                            {tableHeaders.map(header => (
                                <th key={header.key} onClick={() => handleSort(header.key)} className={`cursor-pointer ${header.isNumeric ? 'text-right' : ''}`}>
                                    {header.label} 
                                    {sortConfig.key === header.key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                                </th>
                            ))}
                            <th className="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedInvoices.map((inv: FormattedInvoice) => (
                            <tr key={inv.raw.id}>
                                <td>{new Date(inv.date).toLocaleDateString()}</td>
                                <td><button onClick={() => onViewInvoice(inv.raw.id, false)} className="text-primary hover:underline font-mono">{inv.docNumber}</button></td>
                                <td><span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">Fatura</span></td>
                                <td className="max-w-xs truncate" title={inv.description}>{inv.description}</td>
                                <td className="text-right font-semibold">{formatCurrency(inv.total)}</td>
                                <td className="text-right font-semibold text-success">{formatCurrency(inv.paid)}</td>
                                <td className={`text-right font-bold ${inv.balance > 0 ? 'text-danger' : 'text-text-tertiary'}`}>{formatCurrency(inv.balance)}</td>
                                <td><StatusBadge status={inv.status} /></td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => onViewInvoice(inv.raw.id, false)} className="btn-icon" title="Visualizar/Imprimir">{ICONS.INVOICES}</button>
                                        {inv.balance > 0.01 && (
                                            <button onClick={() => onRegisterPayment(inv.raw.id)} className="btn-icon text-success" title="Registar Pagamento">{ICONS.PAYMENT}</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {processedInvoices.length === 0 && (
                            <tr>
                                <td colSpan={tableHeaders.length + 1} className="text-center p-8 text-text-secondary">Nenhum documento encontrado para os filtros selecionados.</td>
                            </tr>
                         )}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ClientFinancialDashboardPage;