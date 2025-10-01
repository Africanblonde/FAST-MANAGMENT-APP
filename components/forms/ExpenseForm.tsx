import React, { useState } from 'react';

// --- Definições de Tipos (Mínimas para corrigir 'any' errors e importações) ---
type PaymentMethod = {
    name: string;
};

type Expense = {
    id?: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    paymentMethod: string;
};

type ExpenseFormState = {
    description: string;
    amount: string | number;
    date: string;
    type: string;
    paymentMethod: string;
};

interface ExpenseFormProps {
    item: Partial<Expense>;
    onSave: (expense: Partial<Expense>) => void;
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

// CORREÇÃO: Removida a tipagem React.FC e adicionado ExpenseFormProps diretamente aos argumentos
const ExpenseForm = ({ item, onSave, onCancel, paymentMethods }: ExpenseFormProps) => {
    const [expense, setExpense] = useState<ExpenseFormState>({
        description: item.description || '',
        amount: item.amount ?? '',
        date: (item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        type: item.type || 'Geral',
        paymentMethod: item.paymentMethod || (paymentMethods.length > 0 ? paymentMethods[0].name : '')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Corrigido o erro 7006: 'prev' explicitamente tipado
        setExpense((prev: ExpenseFormState) => ({...prev, [name]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...item, 
            ...expense, 
            amount: parseFloat(expense.amount as string) || 0, 
            date: new Date(expense.date).toISOString() 
        });
    };
    
    // Classes Tailwind CSS utilizadas para input e label
    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Detalhes da Despesa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label className={labelClasses}>Descrição da Despesa</label>
                    <input name="description" value={expense.description} onChange={handleChange} placeholder="Ex: Combustível, Aluguel" required className={inputClasses}/>
                </div>
                <div className="form-group">
                    <label className={labelClasses}>Valor (MT)</label>
                    <input name="amount" type="number" step="0.01" value={expense.amount} onChange={handleChange} placeholder="0.00" required className={inputClasses}/>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className={labelClasses}>Tipo de Despesa</label>
                        <select name="type" value={expense.type} onChange={handleChange} required className={inputClasses}>
                            <option value="Geral">Geral</option>
                            <option value="Compra Fornecedor">Compra de Fornecedor</option>
                            <option value="Pagamento de Salário">Pagamento de Salário</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className={labelClasses}>Método de Pagamento</label>
                        <select name="paymentMethod" value={expense.paymentMethod} onChange={handleChange} required className={inputClasses}>
                            {/* Corrigido o erro 7006: 'method' explicitamente tipado */}
                            {paymentMethods.map((method: PaymentMethod) => (
                                <option key={method.name} value={method.name}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className={labelClasses}>Data</label>
                    <input type="date" name="date" value={expense.date} onChange={handleChange} required className={inputClasses}/>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-150">
                        Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-md">
                        Guardar Despesa
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
