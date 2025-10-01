import React, { useState } from 'react';
import type { PaymentMethod, Expense } from '../../types';

interface ExpenseFormProps {
    item: Partial<Expense>;
    onSave: (expense: Partial<Expense>) => void;
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

// ✅ Definir o tipo do estado
type ExpenseState = {
    description: string;
    amount: string;
    date: string;
    type: string;
    paymentMethod: string;
};

const ExpenseForm = ({ item, onSave, onCancel, paymentMethods }: ExpenseFormProps) => {
    const [expense, setExpense] = useState<ExpenseState>({
        description: item.description || '',
        amount: item.amount?.toString() || '',
        date: (item.date || new Date().toISOString()).split('T')[0],
        type: item.type || 'Geral',
        paymentMethod: item.paymentMethod || (paymentMethods.length > 0 ? paymentMethods[0].name : '')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // ✅ Tipar 'prev' explicitamente
        setExpense((prev: ExpenseState) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...item, 
            ...expense, 
            amount: parseFloat(expense.amount) || 0, 
            date: new Date(expense.date).toISOString() 
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
                <label className="form-label">Descrição da Despesa</label>
                <input 
                    name="description" 
                    value={expense.description} 
                    onChange={handleChange} 
                    placeholder="Descrição da Despesa" 
                    required 
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Valor (MT)</label>
                <input 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    value={expense.amount} 
                    onChange={handleChange} 
                    placeholder="Valor (MT)" 
                    required 
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Tipo de Despesa</label>
                <select 
                    name="type" 
                    value={expense.type} 
                    onChange={handleChange} 
                    required 
                    className="form-select"
                >
                    <option value="Geral">Geral</option>
                    <option value="Compra Fornecedor">Compra de Fornecedor</option>
                    <option value="Pagamento de Salário">Pagamento de Salário</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Método de Pagamento</label>
                <select 
                    name="paymentMethod" 
                    value={expense.paymentMethod} 
                    onChange={handleChange} 
                    required 
                    className="form-select"
                >
                    {paymentMethods.map((method) => (
                        <option key={method.name} value={method.name}>{method.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Data</label>
                <input 
                    type="date" 
                    name="date" 
                    value={expense.date} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                />
            </div>
            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Despesa</button>
            </div>
        </form>
    );
};

export default ExpenseForm;