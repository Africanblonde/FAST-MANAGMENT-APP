import React, { useMemo, useState } from 'react';
import type { Invoice, Expense, Client, Occurrence, Purchase, SalaryAdvance, ExtraReceipt, Employee, Supplier } from '../types';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ComposedChart, Line } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { ICONS } from '../constants';

interface ReportsPageProps {
    invoices: Invoice[];
    expenses: Expense[];
    clients: Client[];
    occurrences: Occurrence[];
    purchases: Purchase[];
    salaryAdvances: SalaryAdvance[];
    extraReceipts: ExtraReceipt[];
    employees: Employee[];
    suppliers: Supplier[];
}

type ActivityReportItem = {
    date: string;
    type: string;
    description: string;
    amount: number;
    kind: 'credit' | 'debit' | 'info';
    icon: React.ReactNode;
};

const ReportsPage: React.FC<ReportsPageProps> = ({ invoices, expenses, clients, occurrences, purchases, salaryAdvances, extraReceipts, employees, suppliers }) => {

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activityReport, setActivityReport] = useState<ActivityReportItem[] | null>(null);

    const monthlyData = useMemo(() => {
        const dataMap: { [key: string]: { name: string, receitas: number, despesas: number, lucro: number } } = {};
        const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-PT', { month: 'short', year: 'numeric' });

        invoices.forEach(inv => {
            (inv.payments || []).forEach(p => {
                const month = formatDate(p.date);
                if (!dataMap[month]) dataMap[month] = { name: month, receitas: 0, despesas: 0, lucro: 0 };
                dataMap[month].receitas += p.amount;
            });
        });
        
        extraReceipts.forEach(r => {
            const month = formatDate(r.date);
            if (!dataMap[month]) dataMap[month] = { name: month, receitas: 0, despesas: 0, lucro: 0 };
            dataMap[month].receitas += r.amount;
        });

        expenses.forEach(exp => {
            const month = formatDate(exp.date);
            if (!dataMap[month]) dataMap[month] = { name: month, receitas: 0, despesas: 0, lucro: 0 };
            dataMap[month].despesas += exp.amount;
        });

        return Object.values(dataMap).map(data => ({
            ...data,
            lucro: data.receitas - data.despesas
        })).sort((a,b) => new Date(`01 ${a.name.replace(' de ',' ')}`).getTime() - new Date(`01 ${b.name.replace(' de ',' ')}`).getTime());

    }, [invoices, expenses, extraReceipts]);
    
    const summaryStats = useMemo(() => {
        const totalReceitas = monthlyData.reduce((sum, d) => sum + d.receitas, 0);
        const totalDespesas = monthlyData.reduce((sum, d) => sum + d.despesas, 0);
        const totalLucro = totalReceitas - totalDespesas;
        const averageMonthlyProfit = monthlyData.length > 0 ? totalLucro / monthlyData.length : 0;
        
        return {
            totalReceitas,
            totalDespesas,
            totalLucro,
            averageMonthlyProfit,
            clientCount: clients.length,
            invoiceCount: invoices.length,
        }
    }, [monthlyData, clients, invoices]);
    
    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecione um período de datas.');
            return;
        }

        const start = new Date(startDate).getTime();
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const endTime = end.getTime();

        const allActivities: ActivityReportItem[] = [];

        // Credits: Invoice Payments
        invoices.forEach(inv => {
            (inv.payments || []).forEach(p => {
                const pDate = new Date(p.date).getTime();
                if (pDate >= start && pDate <= endTime) {
                    allActivities.push({
                        date: p.date,
                        type: 'Recebimento de Fatura',
                        description: `Pagamento Fatura #${inv.id} - ${inv.clientName}`,
                        amount: p.amount,
                        kind: 'credit',
                        icon: ICONS.PAYMENT
                    });
                }
            });
        });

        // Credits: Extra Receipts
        extraReceipts.forEach(r => {
            const rDate = new Date(r.date).getTime();
             if (rDate >= start && rDate <= endTime) {
                allActivities.push({
                    date: r.date,
                    type: 'Receita Extra',
                    description: r.description,
                    amount: r.amount,
                    kind: 'credit',
                    icon: ICONS.EXTRA_RECEIPTS
                });
            }
        });

        // Debits: Expenses
        expenses.forEach(exp => {
            const expDate = new Date(exp.date).getTime();
            if (expDate >= start && expDate <= endTime) {
                allActivities.push({
                    date: exp.date,
                    type: `Despesa (${exp.type})`,
                    description: exp.description,
                    amount: exp.amount,
                    kind: 'debit',
                    icon: ICONS.EXPENSES
                });
            }
        });

        // Debits: Purchases
        purchases.forEach(pur => {
            const purDate = new Date(pur.date).getTime();
            if (purDate >= start && purDate <= endTime) {
                const supplierName = suppliers.find(s => s.id === pur.supplierId)?.name || 'Fornecedor';
                allActivities.push({
                    date: pur.date,
                    type: 'Compra a Fornecedor',
                    description: `${pur.description} (${supplierName})`,
                    amount: pur.amount,
                    kind: 'debit',
                    icon: ICONS.PURCHASES
                });
            }
        });
        
        // Debits: Salary Advances
        salaryAdvances.forEach(adv => {
            const advDate = new Date(adv.date).getTime();
             if (advDate >= start && advDate <= endTime) {
                const employee = employees.find(e => e.id === adv.employeeId);
                allActivities.push({
                    date: adv.date,
                    type: 'Adiantamento Salarial',
                    description: `Para: ${employee?.name || 'Funcionário Desconhecido'}`,
                    amount: adv.amount,
                    kind: 'debit',
                    icon: ICONS.SALARY_ADVANCES
                });
            }
        });
        
        // Info: Occurrences
        occurrences.forEach(occ => {
            const occDate = new Date(occ.created_at).getTime();
            if (occDate >= start && occDate <= endTime) {
                allActivities.push({
                    date: occ.created_at,
                    type: 'Ocorrência',
                    description: `${occ.person}: ${occ.description}`,
                    amount: 0,
                    kind: 'info',
                    icon: ICONS.OCCURRENCES
                });
            }
        });

        const sortedActivities = allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivityReport(sortedActivities);
    };

    return (
        <div className="space-y-8">
            <h1 className="section-title">Relatórios</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-body">
                        <h2 style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 600}}>Total de Receitas</h2>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)'}}>{formatCurrency(summaryStats.totalReceitas)}</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <h2 style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 600}}>Total de Despesas</h2>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-danger)'}}>{formatCurrency(summaryStats.totalDespesas)}</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <h2 style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 600}}>Lucro Total</h2>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', color: summaryStats.totalLucro >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}}>{formatCurrency(summaryStats.totalLucro)}</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Análise Mensal de Receitas, Despesas e Lucro</h3>
                </div>
                <div className="card-body">
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" width={100} tick={{ fontSize: '12px' }} tickFormatter={(value: number) => new Intl.NumberFormat('pt-PT', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                        <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                        <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} name="Lucro" />
                    </ComposedChart>
                </ResponsiveContainer>
                </div>
            </div>
            
            <div className="card">
                <div className="card-header">
                    <h3>Relatório de Atividade por Período</h3>
                </div>
                <div className="card-body">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" />
                        <span style={{color: 'var(--color-text-secondary)'}}>até</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" />
                        <button onClick={handleGenerateReport} className="btn btn-primary">Gerar Relatório</button>
                    </div>

                {activityReport && (
                    <div className="mt-6 border-t border-slate-700 pt-4">
                        {activityReport.length === 0 ? (
                            <p style={{color: 'var(--color-text-secondary)'}}>Nenhuma atividade encontrada no período selecionado.</p>
                        ) : (
                            <div className="space-y-3" style={{maxHeight: '500px', overflowY: 'auto'}}>
                                {activityReport.map((item, index) => (
                                    <div key={index} className="card" style={{padding: '1rem', backgroundColor: 'hsla(220, 26%, 12%, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                                        <div className={`p-2 rounded-full ${item.kind === 'credit' ? 'bg-green-900/50 text-green-400' : item.kind === 'debit' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                            {item.icon}
                                        </div>
                                        <div style={{flexGrow: 1}}>
                                            <p style={{fontWeight: '600', color: 'var(--color-text-primary)'}}>{item.type} <span style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal'}}>({new Date(item.date).toLocaleString('pt-PT')})</span></p>
                                            <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>{item.description}</p>
                                        </div>
                                        {item.kind !== 'info' && (
                                            <p style={{fontWeight: 'bold', fontSize: '1.125rem', color: item.kind === 'credit' ? 'var(--color-success)' : 'var(--color-danger)'}}>
                                                {item.kind === 'credit' ? '+' : '-'} {formatCurrency(item.amount)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;