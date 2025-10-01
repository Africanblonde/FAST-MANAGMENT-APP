import React, { useState } from 'react';
import type { PaymentMethod } from '../../types';

interface PaymentMethodFormProps {
    item: { originalName: string | null } & Partial<PaymentMethod>;
    onSave: (data: { originalName: string | null, newName: string, newBalance: number }) => void;
    onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ item, onSave, onCancel }) => {
    const [name, setName] = useState(item.name || '');
    const [balance, setBalance] = useState(item.initialBalance ?? 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ originalName: item.originalName, newName: name, newBalance: balance });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da Plataforma (Ex: M-Pesa)"
                required
                className="w-full p-2 bg-slate-700 rounded"
            />
             <div>
                <label htmlFor="initialBalance" className="block text-sm font-medium text-slate-300 mb-1">Saldo Inicial</label>
                <input 
                    id="initialBalance"
                    name="initialBalance" 
                    type="number"
                    step="0.01"
                    value={balance ?? ''}
                    onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                    placeholder="Valor inicial nesta conta"
                    required
                    className="w-full p-2 bg-slate-700 rounded"
                />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
            </div>
        </form>
    );
};

export default PaymentMethodForm;