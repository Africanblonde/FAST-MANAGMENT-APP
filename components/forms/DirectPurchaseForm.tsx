import React, { useState, useMemo } from 'react';
import type { Supplier, PaymentMethod, Purchase } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface DirectPurchaseFormProps {
    onSave: (data: { description: string, purchasePrice: number, unitPrice: number, supplierId: string, purchaseType: 'debit' | 'credit', paymentMethod: string }) => void;
    onCancel: () => void;
    suppliers: Supplier[];
    paymentMethods: PaymentMethod[];
    purchases: Purchase[];
}

const DirectPurchaseForm = ({ onSave, onCancel, suppliers, paymentMethods, purchases }: DirectPurchaseFormProps) => {
    const [purchase, setPurchase] = useState({
        description: '',
        purchasePrice: '',
        supplierId: '',
        purchaseType: 'debit' as 'debit' | 'credit',
        paymentMethod: paymentMethods[0]?.name || '',
        salePriceMarkupType: 'percentage' as 'percentage' | 'fixed',
        salePriceMarkupValue: '50',
    });
    
    const supplierPurchaseHistory = useMemo(() => {
        if (!purchase.supplierId) return [];
        const supplierPurchases = purchases.filter((p: Purchase) => p.supplierId === purchase.supplierId).map((p: Purchase) => ({description: p.description, amount: p.amount }));
        return Array.from(new Map(supplierPurchases.map((p: { description: string, amount: number }) => [p.description, p])).values()); // Unique descriptions
    }, [purchase.supplierId, purchases]);

    const unitPrice = useMemo(() => {
        const markup = parseFloat(purchase.salePriceMarkupValue) || 0;
        const cost = parseFloat(purchase.purchasePrice) || 0;
        if(purchase.salePriceMarkupType === 'fixed') {
            return markup;
        }
        if(purchase.salePriceMarkupType === 'percentage') {
            const finalPrice = cost * (1 + markup / 100);
            return Math.round(finalPrice * 100) / 100; // round to 2 decimal places
        }
        return 0;
    }, [purchase.purchasePrice, purchase.salePriceMarkupType, purchase.salePriceMarkupValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPurchase((prev: typeof purchase) => ({...prev, [name]: value }));
        
        if (name === 'supplierId' && value === '') {
            setPurchase((prev: typeof purchase) => ({ ...prev, description: '', purchasePrice: ''}));
        }
    };
    
    const handleHistorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const description = e.target.value;
        if (!description) {
            setPurchase((prev: typeof purchase) => ({ ...prev, description: '', purchasePrice: ''}));
            return;
        }
        const historicPurchase = supplierPurchaseHistory.find((p: { description: string, amount: number }) => p.description === description);
        if (historicPurchase) {
            setPurchase((prev: typeof purchase) => ({ ...prev, description: historicPurchase.description, purchasePrice: String(historicPurchase.amount) }));
        }
    };

    const handleSave = () => {
        const purchasePriceNum = parseFloat(purchase.purchasePrice);
        if(!purchase.description || isNaN(purchasePriceNum) || purchasePriceNum <= 0 || !purchase.supplierId) {
            alert("Por favor, preencha Fornecedor, Descrição e Preço de Compra com valores válidos.");
            return;
        }
        if(unitPrice <= 0) {
            alert("O preço de venda deve ser maior que zero.");
            return;
        }
        onSave({ 
            description: purchase.description,
            purchasePrice: purchasePriceNum,
            unitPrice: unitPrice,
            supplierId: purchase.supplierId,
            purchaseType: purchase.purchaseType,
            paymentMethod: purchase.paymentMethod
        });
    };

    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-white">Registar Compra de Peça</h3>
             <select name="supplierId" value={purchase.supplierId} onChange={handleChange} required className="form-select">
                <option value="">Selecione o Fornecedor</option>
                {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            {purchase.supplierId && supplierPurchaseHistory.length > 0 && (
                <select onChange={handleHistorySelect} className="form-select">
                    <option value="">-- Ou selecione um item do histórico --</option>
                    {supplierPurchaseHistory.map((p: { description: string, amount: number }) => <option key={p.description} value={p.description}>{p.description}</option>)}
                </select>
            )}

            <input name="description" value={purchase.description} onChange={handleChange} placeholder="Nome/Descrição da Peça" required className="form-input"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Preço de Compra</label>
                    <input name="purchasePrice" type="number" step="0.01" value={purchase.purchasePrice} onChange={handleChange} required className="form-input"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Preço de Venda</label>
                    <div className="flex items-center gap-2">
                        <input name="salePriceMarkupValue" type="number" step="0.01" value={purchase.salePriceMarkupValue} onChange={handleChange} className="form-input"/>
                        <select name="salePriceMarkupType" value={purchase.salePriceMarkupType} onChange={handleChange} className="form-select">
                            <option value="percentage">%</option>
                            <option value="fixed">MT</option>
                        </select>
                    </div>
                     <p className="text-xs text-slate-400 mt-1">Preço final calculado: <span className="font-bold text-green-400">{formatCurrency(unitPrice)}</span></p>
                </div>
            </div>
            <select name="purchaseType" value={purchase.purchaseType} onChange={handleChange} required className="form-select">
                <option value="debit">Paga a Débito (na hora)</option>
                <option value="credit">Comprada a Crédito</option>
            </select>
            {purchase.purchaseType === 'debit' && (
                <select name="paymentMethod" value={purchase.paymentMethod} onChange={handleChange} required className="form-select">
                    <option value="">Forma de Pagamento</option>
                    {paymentMethods.map((pm: PaymentMethod) => <option key={pm.name} value={pm.name}>{pm.name}</option>)}
                </select>
            )}
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="button" onClick={handleSave} className="btn btn-primary">Adicionar à Fatura</button>
            </div>
        </div>
    );
};

export default DirectPurchaseForm;