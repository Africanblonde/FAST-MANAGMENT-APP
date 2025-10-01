import React, { useState } from 'react';
import type { InvoicePayment, PaymentMethod } from '../../types';

interface EditPaymentFormProps {
    payment: InvoicePayment;
    onSave: (payment: InvoicePayment) => void;
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
}

const EditPaymentForm: React.FC<EditPaymentFormProps> = ({ payment: initialPayment, onSave, onCancel, paymentMethods }) => {
    const [payment, setPayment] = useState({
        amount: initialPayment.amount,
        method: initialPayment.method,
        date: initialPayment.date.split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPayment(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...initialPayment, 
            amount: payment.amount, 
            method: payment.method, 
            date: new Date(payment.date).toISOString() 
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="amount" className="form-label">Valor</label>
                <input id="amount" name="amount" type="number" step="0.01" value={payment.amount} onChange={handleChange} placeholder="Valor" required className="form-input" />
            </div>
             <div>
                <label htmlFor="method" className="form-label">Método de Pagamento</label>
                <select id="method" name="method" value={payment.method} onChange={handleChange} required className="form-select">
                    {paymentMethods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                <input id="date" type="date" name="date" value={payment.date} onChange={handleChange} required className="form-input" />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button type="button" onClick={onCancel} className="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Alterações</button>
            </div>
        </form>
    );
};

export default EditPaymentForm;