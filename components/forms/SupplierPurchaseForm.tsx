import React, { useState, useEffect } from 'react';
import type { Supplier, PaymentMethod } from '../../types';

interface SupplierPurchaseFormProps {
    onSave: (data: any) => void;
    onCancel: () => void;
    suppliers: Supplier[];
    paymentMethods: PaymentMethod[];
    preselectedSupplierId: string | null;
}

interface PurchaseState {
    supplierId: string;
    description: string;
    amount: number;
    date: string;
    purchaseType: 'credit' | 'debit';
    paymentMethod: string;
}

const SupplierPurchaseForm: React.FC<SupplierPurchaseFormProps> = ({ 
    onSave, 
    onCancel, 
    suppliers, 
    paymentMethods, 
    preselectedSupplierId 
}: SupplierPurchaseFormProps) => {
    const [purchase, setPurchase] = useState<PurchaseState>({
        supplierId: preselectedSupplierId || '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        purchaseType: 'credit',
        paymentMethod: paymentMethods[0]?.name || ''
    });

    useEffect(() => {
        if(preselectedSupplierId) {
            setPurchase((prev: PurchaseState) => ({...prev, supplierId: preselectedSupplierId}));
        }
    }, [preselectedSupplierId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPurchase((prev: PurchaseState) => ({
            ...prev, 
            [name]: name === 'amount' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!purchase.supplierId || !purchase.description || purchase.amount <= 0) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        onSave(purchase);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <select 
                 name="supplierId" 
                 value={purchase.supplierId} 
                 onChange={handleChange} 
                 required 
                 className="form-select" 
                 disabled={!!preselectedSupplierId}
             >
                <option value="">Selecione o Fornecedor</option>
                {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input 
                name="description" 
                value={purchase.description} 
                onChange={handleChange} 
                placeholder="Descrição da Compra/Dívida" 
                required 
                className="form-input"
            />
            <input 
                name="amount" 
                type="number" 
                step="0.01" 
                value={purchase.amount ?? ''} 
                onChange={handleChange} 
                placeholder="Valor Total" 
                required 
                className="form-input"
            />
            <input 
                name="date" 
                type="date" 
                value={purchase.date} 
                onChange={handleChange} 
                required 
                className="form-input"
            />
            <select 
                name="purchaseType" 
                value={purchase.purchaseType} 
                onChange={handleChange} 
                required 
                className="form-select"
            >
                <option value="credit">A Crédito (dívida pendente)</option>
                <option value="debit">Paga na Hora</option>
            </select>
            {purchase.purchaseType === 'debit' && (
                <select 
                    name="paymentMethod" 
                    value={purchase.paymentMethod} 
                    onChange={handleChange} 
                    required 
                    className="form-select"
                >
                    {paymentMethods.map((pm: PaymentMethod) => (
                        <option key={pm.name} value={pm.name}>{pm.name}</option>
                    ))}
                </select>
            )}
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Compra</button>
            </div>
        </form>
    );
};

export default SupplierPurchaseForm;