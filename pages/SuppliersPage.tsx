import React, { useState, useMemo, useCallback } from 'react';
import type { Supplier, Purchase, Expense, Permission } from '../types';
import { formatCurrency } from '../utils/helpers';
import Modal from '../components/Modal';
import { ICONS } from '../constants';

const SupplierDebtDetails: React.FC<{
    supplier: Supplier,
    purchases: Purchase[],
    onPay: (purchase: Purchase) => void,
    onAddNewDebt: () => void,
    getPurchaseBalance: (purchaseId: string) => number,
}> = ({ supplier, purchases, onPay, onAddNewDebt, getPurchaseBalance }) => {

    const pendingPurchases = useMemo(() => {
        return purchases
            .filter(p => p.supplierId === supplier.id)
            .map(p => ({ ...p, balance: getPurchaseBalance(p.id) }))
            .filter(p => p.balance > 0.01);
    }, [purchases, supplier.id, getPurchaseBalance]);
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold">Dívidas Pendentes para {supplier.name}</h3>
                 <button onClick={onAddNewDebt} className="btn btn-primary text-sm">Adicionar Dívida</button>
            </div>
           
            {pendingPurchases.length === 0 ? (
                <p className="text-slate-400">Nenhuma dívida pendente para este fornecedor.</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto p-1">
                    {pendingPurchases.map(purchase => (
                        <div key={purchase.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{purchase.description}</p>
                                <p className="text-sm text-slate-400">Data: {new Date(purchase.date).toLocaleDateString()}</p>
                                <p className="font-bold text-red-400">Em dívida: {formatCurrency(purchase.balance)}</p>
                            </div>
                            <button onClick={() => onPay(purchase)} className="btn btn-success">Pagar</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const SuppliersPage: React.FC<{
    suppliers: Supplier[];
    purchases: Purchase[];
    expenses: Expense[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddPurchase: (supplierId: string | null) => void;
    onPayPurchase: (purchase: Purchase, balance: number) => void;
    hasPermission: (p: Permission) => boolean;
}> = ({ suppliers, purchases, expenses, onAdd, onEdit, onDelete, onAddPurchase, onPayPurchase, hasPermission }) => {
    
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const getPurchaseBalance = useCallback((purchaseId: string): number => {
        const purchase = purchases.find(p => p.id === purchaseId);
        if (!purchase) return 0;
        const paymentsTotal = expenses
            .filter(e => e.purchaseId === purchaseId)
            .reduce((sum, e) => sum + e.amount, 0);
        return purchase.amount - paymentsTotal;
    }, [purchases, expenses]);
    
    const suppliersWithDebt = useMemo(() => {
        return suppliers.map(supplier => {
            const totalDebt = purchases
                .filter(p => p.supplierId === supplier.id)
                .reduce((sum, p) => sum + getPurchaseBalance(p.id), 0);
            return { ...supplier, totalDebt };
        }).sort((a,b) => b.totalDebt - a.totalDebt);
    }, [suppliers, purchases, getPurchaseBalance]);

    const stats = useMemo(() => {
        const totalDebt = suppliersWithDebt.reduce((sum, s) => sum + s.totalDebt, 0);
        const totalPaid = expenses
            .filter(e => e.type === 'Compra Fornecedor')
            .reduce((sum, e) => sum + e.amount, 0);
        return {
            totalSuppliers: suppliers.length,
            totalDebt,
            totalPaid,
        };
    }, [suppliers.length, suppliersWithDebt, expenses]);

    const renderSupplierCard = (supplier: Supplier & { totalDebt: number }) => (
        <div key={supplier.id} className="card flex flex-col justify-between">
            <div className="p-4">
                <h3 className="text-lg font-bold text-white">{supplier.name}</h3>
                <p className="text-slate-400 text-sm">{supplier.contact}</p>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400">Dívida Pendente</p>
                    <p className={`text-2xl font-bold ${supplier.totalDebt > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                        {formatCurrency(supplier.totalDebt)}
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-1 p-2 border-t border-slate-700/50 bg-[hsla(220,26%,12%,0.5)] rounded-b-lg">
                <button onClick={() => setSelectedSupplier(supplier)} className="btn-icon" title="Ver Dívidas">{ICONS.STATEMENT}</button>
                {hasPermission('manage_suppliers') && (
                    <>
                        <button onClick={() => onAddPurchase(supplier.id)} className="btn-icon" title="Registar Compra/Dívida">{ICONS.QUICK_SALE}</button>
                        <button onClick={() => onEdit(supplier.id)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        <button onClick={() => onDelete(supplier.id)} className="btn-icon text-red-500" title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center flex-wrap gap-4">
                <h1>Fornecedores & Compras</h1>
                <div className="flex gap-2 flex-wrap">
                    {hasPermission('manage_suppliers') && (
                        <>
                             <button onClick={() => onAddPurchase(null)} className="btn btn-ghost">Registar Compra</button>
                            <button onClick={onAdd} className="btn btn-primary">Adicionar Fornecedor</button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-4"><h2 className="text-slate-400 text-sm">Total de Fornecedores</h2><p className="text-2xl font-bold">{stats.totalSuppliers}</p></div>
                <div className="card p-4"><h2 className="text-slate-400 text-sm">Dívida Total</h2><p className="text-2xl font-bold text-[var(--color-warning)]">{formatCurrency(stats.totalDebt)}</p></div>
                <div className="card p-4"><h2 className="text-slate-400 text-sm">Total Pago (Histórico)</h2><p className="text-2xl font-bold text-[var(--color-success)]">{formatCurrency(stats.totalPaid)}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliersWithDebt.length > 0 ? (
                    suppliersWithDebt.map(renderSupplierCard)
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center card p-12">
                         <p className="text-slate-400">Nenhum fornecedor encontrado.</p>
                    </div>
                )}
            </div>

            {selectedSupplier && (
                <Modal 
                    isOpen={!!selectedSupplier} 
                    onClose={() => setSelectedSupplier(null)} 
                    title={`Dívidas de ${selectedSupplier.name}`}
                    size="3xl"
                >
                    <SupplierDebtDetails
                        supplier={selectedSupplier}
                        purchases={purchases}
                        getPurchaseBalance={getPurchaseBalance}
                        onAddNewDebt={() => {
                            const supplierId = selectedSupplier.id;
                            setSelectedSupplier(null);
                            setTimeout(() => onAddPurchase(supplierId), 100);
                        }}
                        onPay={(purchase) => {
                             setSelectedSupplier(null);
                             setTimeout(() => onPayPurchase(purchase, getPurchaseBalance(purchase.id)), 100);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default SuppliersPage;