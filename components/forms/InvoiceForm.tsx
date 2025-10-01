import React, { useState, useMemo, useEffect } from 'react';
import type { Client, Vehicle, Service, Part, Invoice, InvoiceItem, User, LayoutSettings, Supplier, PaymentMethod, Purchase } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import Modal from '../Modal';
import CustomItemForm from './CustomItemForm';
import DirectPurchaseForm from './DirectPurchaseForm';
import { ICONS } from '../../constants';

interface InvoiceFormProps {
    initialInvoice: Partial<Invoice>;
    onSave: (invoice: Invoice) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[];
    services: Service[];
    parts: Part[];
    activeUser: User;
    layoutSettings: LayoutSettings;
    suppliers: Supplier[];
    paymentMethods: PaymentMethod[];
    purchases: Purchase[];
    onSavePurchase: (purchaseData: any) => Promise<{ success: boolean; error?: string }>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
    initialInvoice, onSave, onCancel, clients, vehicles, services, parts, activeUser, layoutSettings,
    suppliers, paymentMethods, purchases, onSavePurchase
}) => {
    
    type InvoiceState = Omit<Invoice, 'discount' | 'items'> & {
        discount: string | number;
        items: (Omit<InvoiceItem, 'quantity' | 'unitPrice'> & { quantity: string | number, unitPrice: string | number })[];
    };

    const [invoice, setInvoice] = useState<InvoiceState>({
        id: initialInvoice.id || '',
        // FIX: Added missing properties to the initial state to match the InvoiceState type.
        display_id: initialInvoice.display_id || null,
        company_id: initialInvoice.company_id || activeUser?.company_id || '',
        clientId: initialInvoice.clientId || '',
        vehicleId: initialInvoice.vehicleId || '',
        clientName: initialInvoice.clientName || '',
        vehicleLicensePlate: initialInvoice.vehicleLicensePlate || '',
        items: (initialInvoice.items || []).map(i => ({...i, quantity: i.quantity ?? '', unitPrice: i.unitPrice ?? ''})),
        payments: initialInvoice.payments || [],
        subtotal: initialInvoice.subtotal || 0,
        total: initialInvoice.total || 0,
        taxAmount: initialInvoice.taxAmount || 0,
        taxApplied: initialInvoice.taxApplied ?? layoutSettings.taxEnabled,
        issueDate: initialInvoice.issueDate || new Date().toISOString(),
        status: initialInvoice.status || 'Pendente',
        description: initialInvoice.description || '',
        discount: initialInvoice.discount ?? '',
        discountType: initialInvoice.discountType || 'fixed',
        created_at: initialInvoice.created_at || new Date().toISOString(),
        follow_up_completed_at: initialInvoice.follow_up_completed_at || null,
    });

    const [customItemModalOpen, setCustomItemModalOpen] = useState(false);
    const [directPurchaseModalOpen, setDirectPurchaseModalOpen] = useState(false);

    const clientVehicles = useMemo(() => vehicles.filter(v => v.clientId === invoice.clientId), [invoice.clientId, vehicles]);

    useEffect(() => {
        setInvoice(prev => ({...prev, items: (initialInvoice.items || []).map(i => ({...i, quantity: i.quantity ?? '', unitPrice: i.unitPrice ?? ''}))}));
    }, [initialInvoice.items]);

    useEffect(() => {
        if(invoice.clientId && clientVehicles.length === 1 && !invoice.vehicleId) {
            setInvoice(prev => ({...prev, vehicleId: clientVehicles[0].id}));
        }
    }, [invoice.clientId, clientVehicles, invoice.vehicleId]);

    useEffect(() => {
        const subtotal = invoice.items.reduce((sum, item) => sum + ((parseFloat(item.unitPrice as string) || 0) * (parseInt(item.quantity as string) || 0)), 0);
        const discountValue = parseFloat(invoice.discount as string) || 0;
        
        const discountAmount = invoice.discountType === 'fixed' 
            ? discountValue
            : (subtotal * discountValue) / 100;

        const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
        const taxAmount = invoice.taxApplied ? (subtotalAfterDiscount * layoutSettings.taxRate) / 100 : 0;
        const total = subtotalAfterDiscount + taxAmount;

        setInvoice(prev => ({
            ...prev,
            subtotal: subtotal,
            taxAmount: taxAmount,
            total: total
        }));
    }, [invoice.items, invoice.discount, invoice.discountType, invoice.taxApplied, layoutSettings.taxRate]);

    const handleAddItem = (type: 'service' | 'part', itemId: string) => {
        if (!itemId) return;
        const sourceItems = type === 'service' ? services : parts;
        const sourceItem = sourceItems.find(item => item.id === itemId);
        if (!sourceItem) return;

        const newItem: Omit<InvoiceItem, "quantity" | "unitPrice"> & { quantity: string | number; unitPrice: string | number; } = {
            id: `item-${Date.now()}`,
            company_id: activeUser.company_id,
            invoice_id: invoice.id,
            itemId: sourceItem.id,
            type: type,
            description: sourceItem.name,
            quantity: 1,
            unitPrice: type === 'service' ? (sourceItem as Service).price : (sourceItem as Part).salePrice,
            purchasePrice: 'purchasePrice' in sourceItem ? sourceItem.purchasePrice : null,
            supplierId: 'supplierId' in sourceItem ? sourceItem.supplierId : null,
            isCustom: false,
            created_at: new Date().toISOString(),
        };
        setInvoice(prev => ({...prev, items: [...prev.items, newItem]}));
    };

    const handleItemChange = (itemId: string, field: 'quantity' | 'unitPrice', value: string) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.id === itemId 
                    ? {...item, [field]: value}
                    : item
            )
        }));
    };

    const handleRemoveItem = (itemId: string) => {
        setInvoice(prev => ({...prev, items: prev.items.filter(item => item.id !== itemId)}));
    };

    const handleSaveCustomItem = (data: { type: 'service' | 'part', description: string, unitPrice: number }) => {
        const newItem: Omit<InvoiceItem, "quantity" | "unitPrice"> & { quantity: string | number; unitPrice: string | number; } = {
            id: `item-${Date.now()}`,
            company_id: activeUser.company_id,
            invoice_id: invoice.id,
            itemId: `custom-${Date.now()}`,
            type: data.type,
            description: data.description,
            quantity: 1,
            unitPrice: data.unitPrice,
            // FIX: Added missing properties to match the InvoiceItem type.
            purchasePrice: null,
            supplierId: null,
            isCustom: true,
            created_at: new Date().toISOString(),
        };
        setInvoice(prev => ({...prev, items: [...prev.items, newItem]}));
        setCustomItemModalOpen(false);
    };

    const handleSaveDirectPurchase = async (data: { description: string, purchasePrice: number, unitPrice: number, supplierId: string, purchaseType: 'debit' | 'credit', paymentMethod: string }) => {
        try {
            const result = await onSavePurchase({
                supplierId: data.supplierId,
                description: `Fatura #${invoice.display_id || invoice.id}: ${data.description}`,
                amount: data.purchasePrice,
                date: new Date().toISOString(),
                purchaseType: data.purchaseType,
                paymentMethod: data.paymentMethod,
            });
            
            if (result?.success) {
                const newItem: Omit<InvoiceItem, "quantity" | "unitPrice"> & { quantity: string | number; unitPrice: string | number; } = {
                    id: `item-${Date.now()}`,
                    company_id: activeUser.company_id,
                    invoice_id: invoice.id,
                    itemId: `purchase-${data.supplierId}-${Date.now()}`,
                    type: 'part',
                    description: data.description,
                    quantity: 1,
                    unitPrice: data.unitPrice,
                    purchasePrice: data.purchasePrice,
                    supplierId: data.supplierId,
                    isCustom: true,
                    created_at: new Date().toISOString(),
                };
                setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
                setDirectPurchaseModalOpen(false);
            } else {
                console.error('Erro ao guardar compra:', result?.error);
            }
        } catch (error) {
            console.error('Erro inesperado ao processar compra externa:', error);
            alert('Erro inesperado ao processar compra externa. Tente novamente.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!invoice.clientId || !invoice.vehicleId) {
            alert("Por favor, selecione cliente e viatura.");
            return;
        }

        if (invoice.items.length === 0) {
            alert("Adicione pelo menos um item à fatura.");
            return;
        }

        const finalInvoice: Invoice = {
            ...(invoice as Omit<Invoice, 'items' | 'discount'>),
            discount: parseFloat(String(invoice.discount)) || 0,
            items: invoice.items.map(item => ({
                ...item,
                quantity: parseInt(String(item.quantity), 10) || 1,
                unitPrice: parseFloat(String(item.unitPrice)) || 0,
            })),
        };

        onSave(finalInvoice);
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coluna Esquerda (Principal) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Card: Dados Principais */}
                    <div className="card">
                        <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select name="clientId" value={invoice.clientId} onChange={e => setInvoice(prev => ({...prev, clientId: e.target.value, vehicleId: ''}))} required className="md:col-span-1 form-select">
                                <option value="">-- Selecione um Cliente --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
                            </select>
                            <select name="vehicleId" value={invoice.vehicleId} onChange={e => setInvoice(prev => ({...prev, vehicleId: e.target.value}))} required className="md:col-span-1 form-select" disabled={!invoice.clientId}>
                                <option value="">-- Selecione uma Viatura --</option>
                                {clientVehicles.map(v => <option key={v.id} value={v.id}>{`${v.licensePlate} (${v.model})`}</option>)}
                            </select>
                            <div className="md:col-span-1">
                                <input type="date" name="issueDate" value={invoice.issueDate.split('T')[0]} onChange={e => setInvoice(prev => ({...prev, issueDate: new Date(e.target.value).toISOString()}))} required className="form-input" />
                            </div>
                        </div>
                    </div>

                    {/* Card: Itens da Fatura */}
                    <div className="card">
                        <div className="card-header border-b border-slate-700">
                            <h3>{ICONS.INVOICES} Itens da Fatura</h3>
                        </div>
                        <div className="card-body">
                             <div className="border-b border-slate-700 pb-4 mb-4">
                                <div className="flex flex-wrap gap-3">
                                    <select onChange={e => { if (e.target.value) { handleAddItem('service', e.target.value); e.target.value = ''; } }} className="form-select flex-1 min-w-[180px]">
                                        <option value="">+ Adicionar Serviço</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <select onChange={e => { if (e.target.value) { handleAddItem('part', e.target.value); e.target.value = ''; } }} className="form-select flex-1 min-w-[180px]">
                                        <option value="">+ Adicionar Peça</option>
                                        {parts.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.quantity <= invoice.items.filter(i => i.itemId === p.id).reduce((sum, i) => sum + (parseInt(i.quantity as string) || 0), 0)}>
                                                {p.name} (Stock: {p.quantity - invoice.items.filter(i => i.itemId === p.id).reduce((sum, i) => sum + (parseInt(i.quantity as string) || 0), 0)})
                                            </option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setCustomItemModalOpen(true)} className="btn btn-ghost flex-1 min-w-[180px]">✏️ Item Personalizado</button>
                                    <button type="button" onClick={() => setDirectPurchaseModalOpen(true)} className="btn btn-warning flex-1 min-w-[180px]">🛒 Compra Externa</button>
                                </div>
                            </div>
                            
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                                {invoice.items.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <p>Nenhum item adicionado ainda.</p>
                                    </div>
                                ) : (
                                    invoice.items.map(item => (
                                        <div key={item.id} className="flex flex-wrap items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                            <div className="flex-auto min-w-[120px] mr-2">
                                                <p className="font-semibold text-white truncate">{item.description}</p>
                                                <span className={`text-xs px-1 py-0.5 rounded-full ${item.type === 'service' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>{item.type}</span>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="form-input text-center p-2 w-16" min="1" placeholder="Qtd."/>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} className="form-input text-right p-2 w-24" min="0" placeholder="Preço"/>
                                            </div>
                                            <div className="flex-shrink-0 w-24 text-right font-semibold text-white">
                                                {formatCurrency((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0))}
                                            </div>
                                            <div className="flex-shrink-0">
                                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="btn-icon text-red-400 hover:bg-red-500/20" aria-label="Remover item">&times;</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card: Notas */}
                    <div className="card">
                        <div className="card-header border-b border-slate-700"><h3>📝 Notas / Observações</h3></div>
                        <div className="card-body">
                            <textarea name="description" value={invoice.description || ''} onChange={e => setInvoice(prev => ({...prev, description: e.target.value}))} placeholder="Adicione notas, observações ou informações importantes..." rows={3} className="form-textarea"/>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita (Resumo) */}
                <div className="lg:col-span-1">
                    <div className="card space-y-4 sticky top-6">
                        <div className="card-header border-b border-slate-700"><h3>💰 Resumo Financeiro</h3></div>
                        <div className="card-body space-y-4">
                            <div>
                                <label className="form-label">Desconto</label>
                                <div className="flex">
                                    <input type="number" step="0.01" value={invoice.discount} onChange={e => setInvoice(prev => ({...prev, discount: e.target.value}))} placeholder="0.00" className="form-input rounded-r-none flex-1" />
                                    <select value={invoice.discountType} onChange={e => setInvoice(prev => ({...prev, discountType: e.target.value as 'fixed' | 'percentage'}))} className="form-select rounded-l-none w-20">
                                        <option value="fixed">MT</option>
                                        <option value="percentage">%</option>
                                    </select>
                                </div>
                            </div>
                            {layoutSettings.taxEnabled && (
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={invoice.taxApplied} onChange={(e) => setInvoice(prev => ({...prev, taxApplied: e.target.checked}))} className="form-checkbox" />
                                    <span>Aplicar {layoutSettings.taxName} ({layoutSettings.taxRate}%)</span>
                                </label>
                            )}

                            <div className="space-y-2 pt-4 border-t border-slate-700">
                                <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span><span>{formatCurrency(invoice.subtotal)}</span></div>
                                {parseFloat(String(invoice.discount)) > 0 && (<div className="flex justify-between text-orange-400"><span >Desconto:</span><span>-{formatCurrency(invoice.discountType === 'fixed' ? parseFloat(String(invoice.discount)) : (invoice.subtotal * parseFloat(String(invoice.discount))) / 100)}</span></div>)}
                                {invoice.taxApplied && (<div className="flex justify-between"><span className="text-slate-400">{layoutSettings.taxName}:</span><span>{formatCurrency(invoice.taxAmount)}</span></div>)}
                                <div className="flex justify-between text-2xl font-bold pt-2 border-t-2 border-slate-600"><span className="text-green-400">TOTAL:</span><span className="text-green-400">{formatCurrency(invoice.total)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                 {customItemModalOpen && (
                    <Modal isOpen={customItemModalOpen} onClose={() => setCustomItemModalOpen(false)} title="Adicionar Item Personalizado">
                        <CustomItemForm onSave={handleSaveCustomItem} onCancel={() => setCustomItemModalOpen(false)} />
                    </Modal>
                )}
                {directPurchaseModalOpen && (
                    <Modal isOpen={directPurchaseModalOpen} onClose={() => setDirectPurchaseModalOpen(false)} title="Adicionar Compra Externa" size="3xl">
                        <DirectPurchaseForm onSave={handleSaveDirectPurchase} onCancel={() => setDirectPurchaseModalOpen(false)} suppliers={suppliers} paymentMethods={paymentMethods} purchases={purchases} />
                    </Modal>
                )}
            </form>
            
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 p-4 z-40 lg:left-64">
                <div className="max-w-7xl mx-auto flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary" disabled={!invoice.clientId || !invoice.vehicleId || invoice.items.length === 0}>
                        💾 Guardar Fatura
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;