import React, { useMemo } from 'react';
import type { Expense, Permission } from '../types';
import { formatCurrency } from '../utils/helpers';

const ExpensesPage: React.FC<{
    expenses: Expense[];
    onAdd: () => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}> = ({ expenses, onAdd, onDelete, hasPermission }) => {
    
    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1>Despesas</h1>
                {hasPermission('manage_expenses') && (
                    <button onClick={onAdd} className="btn btn-primary">
                        Adicionar Despesa
                    </button>
                )}
            </div>

            <div className="card table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Método Pag.</th>
                            <th style={{textAlign: 'right'}}>Valor</th>
                            <th style={{textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedExpenses.map(expense => (
                            <tr key={expense.id}>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                <td>{expense.description}</td>
                                <td>{expense.type}</td>
                                <td>{expense.paymentMethod}</td>
                                <td style={{textAlign: 'right', fontWeight: 600}}>{formatCurrency(expense.amount)}</td>
                                <td>
                                    <div className="flex gap-2 justify-end">
                                    {hasPermission('manage_expenses') && (
                                        <button onClick={() => onDelete(expense.id)} className="btn-icon" style={{color: 'var(--color-danger)'}} title="Apagar">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {sortedExpenses.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem'}}>Nenhuma despesa encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesPage;