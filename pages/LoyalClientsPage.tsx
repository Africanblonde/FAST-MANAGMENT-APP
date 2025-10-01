import React, { useMemo, useState } from 'react';
import type { Client, Invoice } from '../types';
import { formatCurrency } from '../utils/helpers';
import { ICONS } from '../constants';

interface LoyalClientsPageProps {
    clients: Client[];
    invoices: Invoice[];
}

type ClientStats = Client & {
    totalSpent: number;
    visitCount: number;
    lastVisitDate: Date | null;
};

// Removido React.FC e tipado diretamente
const LoyalClientsPage = ({ clients, invoices }: LoyalClientsPageProps) => {
    
    const [sortBy, setSortBy] = useState<'totalSpent' | 'visitCount' | 'lastVisitDate'>('totalSpent');
    const [period, setPeriod] = useState<'all' | '6m' | '30d'>('all');

    const clientStats: ClientStats[] = useMemo(() => {
        const getStartDate = (p: typeof period): Date => {
            const now = new Date();
            if (p === '30d') {
                now.setDate(now.getDate() - 30);
                return now;
            }
            if (p === '6m') {
                now.setMonth(now.getMonth() - 6);
                return now;
            }
            return new Date(0); // 'all' time
        };

        const startDate = getStartDate(period);

        const calculatedStats = clients.map((client: Client) => {
            const clientInvoices = invoices.filter((inv: Invoice) => 
                inv.clientId === client.id && new Date(inv.issueDate) >= startDate
            );

            const totalSpent = clientInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
            const visitCount = clientInvoices.length;
            const lastVisitDate = visitCount > 0 
                ? new Date(Math.max(...clientInvoices.map((inv: Invoice) => new Date(inv.issueDate).getTime())))
                : null;
            
            return {
                ...client,
                totalSpent,
                visitCount,
                lastVisitDate,
            };
        }).filter((c: ClientStats) => c.visitCount > 0); // Tipado como ClientStats

        // Sort com parâmetros tipados
        return calculatedStats.sort((a: ClientStats, b: ClientStats) => {
            switch (sortBy) {
                case 'visitCount':
                    return b.visitCount - a.visitCount || b.totalSpent - a.totalSpent;
                case 'lastVisitDate':
                    if (!a.lastVisitDate) return 1;
                    if (!b.lastVisitDate) return -1;
                    return b.lastVisitDate.getTime() - a.lastVisitDate.getTime();
                case 'totalSpent':
                default:
                    return b.totalSpent - a.totalSpent;
            }
        });

    }, [clients, invoices, period, sortBy]);

    const getRankClass = (index: number) => {
        if (index === 0) return 'status-warning';
        if (index === 1) return 'status-success';
        if (index === 2) return 'status-danger';
        return 'status';
    };

    // Componente interno com props tipadas
    const FilterButton = ({ value, label }: { value: typeof period; label: string }) => (
        <button 
            onClick={() => setPeriod(value)}
            className={period === value ? 'btn btn-primary' : 'btn btn-ghost'}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <h1 className="section-title">Clientes VIP</h1>
            
            <div className="card p-4 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-400 mr-2">Período:</span>
                    <FilterButton value="all" label="Geral" />
                    <FilterButton value="6m" label="Últimos 6 Meses" />
                    <FilterButton value="30d" label="Últimos 30 Dias" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400">Ordenar por:</span>
                    <select 
                        value={sortBy} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
                        className="form-select"
                    >
                        <option value="totalSpent">Total Gasto</option>
                        <option value="visitCount">Nº de Visitas</option>
                        <option value="lastVisitDate">Última Visita</option>
                    </select>
                </div>
            </div>

            {clientStats.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center">
                        <p style={{color: 'var(--color-text-secondary)'}}>Nenhum dado de cliente encontrado para o período selecionado.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientStats.map((client: ClientStats, index: number) => (
                        <div key={client.id} className="card" style={{display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}>
                            <div className="card-body">
                           <div className={`absolute top-0 right-0 w-12 h-12 flex items-center justify-center font-black text-2xl rounded-bl-full ${getRankClass(index)}`}>
                                {index + 1}
                           </div>
                           
                           <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 rounded-full" style={{backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.25rem'}}>
                                   {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                               </div>
                               <div>
                                   <h3 style={{fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--color-text-primary)'}}>{`${client.firstName} ${client.lastName}`.trim()}</h3>
                                   <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>{client.contact}</p>
                               </div>
                           </div>

                           <div className="space-y-3 mt-auto pt-4 border-t border-slate-700/50">
                               <div className="flex justify-between items-center">
                                   <span style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>{ICONS.PAYMENT} Total Gasto</span>
                                   <span style={{fontWeight: 'bold', color: 'var(--color-success)'}}>{formatCurrency(client.totalSpent)}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>{ICONS.VEHICLES} Nº de Visitas</span>
                                   <span style={{fontWeight: '600', color: 'var(--color-text-primary)'}}>{client.visitCount}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>{ICONS.CLOCK} Última Visita</span>
                                   <span style={{fontWeight: '600', color: 'var(--color-text-primary)'}}>{client.lastVisitDate ? client.lastVisitDate.toLocaleDateString('pt-PT') : 'N/A'}</span>
                               </div>
                           </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LoyalClientsPage;