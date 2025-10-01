import React, { useMemo, useState, ChangeEvent } from 'react';
import type { Client, Invoice, InvoiceItem, Part, Permission, Service, User } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

// Interfaces para os componentes
interface QuickSaleProps {
    draft: Invoice;
    onUpdate: (field: keyof Invoice, value: any) => void;
    onRemoveItem: (id: string) => void;
    onAddItem: (item: InvoiceItem) => void;
    onClear: () => void;
    onFinalize: () => void;
    clients: Client[];
    services: Service[];
    parts: Part[];
    onAddCustomItem: () => void;
    onAddClient: () => void;
    activeUser: User;
}

interface FollowUpProps {
    warrantyItems: any[];
    maintenanceItems: any[];
    onMarkComplete: (invoiceId: string) => void;
}

// Sub-components specific to Dashboard

const QuickSale: React.FC<QuickSaleProps> = (props: QuickSaleProps) => {
    const { 
        draft, 
        onUpdate, 
        onRemoveItem, 
        onAddItem, 
        onClear, 
        onFinalize, 
        clients, 
        services, 
        parts, 
        onAddCustomItem, 
        onAddClient, 
        activeUser 
    } = props;
    
    const { t } = useLanguage();
    const { formatCurrency: formatCurrencyWithCurrency } = useCurrency();
    const total = useMemo(() => draft.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.unitPrice), 0), [draft.items]);

    const handleSelectAndAddItem = (e: ChangeEvent<HTMLSelectElement>, type: 'service' | 'part') => {
        const id = e.target.value;
        if (!id) return;
        
        const sourceList = type === 'service' ? services : parts;
        const item = sourceList.find(i => i.id === id);
        
        if (!item) return;
        
        if (type === 'part' && (item as Part).quantity <= 0) {
            alert(`A peça "${item.name}" está fora de stock.`);
            e.target.value = '';
            return;
        }

        const newItem: InvoiceItem = {
            id: `item-${Date.now()}`,
            company_id: activeUser.company_id,
            invoice_id: draft.id || '', // draft might not have an ID yet
            itemId: item.id,
            type: type,
            description: item.name,
            quantity: 1,
            unitPrice: type === 'service' ? (item as Service).price : (item as Part).salePrice,
            // FIX: Corrected properties to match the InvoiceItem type.
            purchasePrice: type === 'part' ? (item as Part).purchasePrice : null,
            supplierId: type === 'part' ? (item as Part).supplierId : null,
            isCustom: false,
            created_at: new Date().toISOString(),
        };

        onAddItem(newItem);
        e.target.value = ''; // Reset select
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 className="flex items-center gap-2">{ICONS.QUICK_SALE} {t('dashboard.quickSale')}</h3>
            </div>
            <div className="space-y-4" style={{ padding: '1rem', flexGrow: 1, overflowY: 'auto' }}>
                <select value={draft.clientId} onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdate('clientId', e.target.value)} className="form-select">
                    <option value="">-- {t('dashboard.selectClient')} --</option>
                    {clients.map((c: Client) => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
                </select>

                <div className="space-y-2">
                    <button onClick={onAddClient} className="btn btn-ghost" style={{width: '100%', backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)'}}>
                       <div className="w-4 h-4">{ICONS.USER_PLUS}</div> {t('dashboard.addClient')}
                    </button>
                    <select onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSelectAndAddItem(e, 'service')} className="form-select">
                        <option value="">+ {t('dashboard.addService')}</option>
                        {services.map((s: Service) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                     <select onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSelectAndAddItem(e, 'part')} className="form-select">
                        <option value="">+ {t('dashboard.addPart')}</option>
                        {parts.map((p: Part) => <option key={p.id} value={p.id} disabled={p.quantity <= 0}>{`${p.name} (${p.quantity})`}</option>)}
                    </select>
                    <button onClick={onAddCustomItem} className="btn btn-secondary" style={{width: '100%'}}>+ {t('dashboard.customItem')}</button>
                </div>

                <div className="space-y-2">
                    {draft.items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '1rem 0' }}>{t('dashboard.noItemsAdded')}</p>}
                    {draft.items.map((item: InvoiceItem) => (
                        <div key={item.id} className="flex items-center" style={{ backgroundColor: 'var(--color-background)', padding: '0.5rem', borderRadius: 'var(--radius-md)'}}>
                            <div style={{ flexGrow: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.description}</p>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{item.quantity} x {formatCurrencyWithCurrency(item.unitPrice)}</p>
                            </div>
                            <button onClick={() => onRemoveItem(item.id)} className="btn-icon" style={{color: 'var(--color-danger)'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3" style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <div className="flex justify-between" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    <span>{t('dashboard.subtotal')}:</span>
                    <span>{formatCurrencyWithCurrency(total)}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClear} className="btn btn-ghost" style={{width: '100%'}}>{t('dashboard.clear')}</button>
                    <button onClick={onFinalize} className="btn btn-primary" style={{width: '100%'}}>{t('dashboard.createInvoice')}</button>
                </div>
            </div>
        </div>
    );
};

const FollowUp: React.FC<FollowUpProps> = (props: FollowUpProps) => {
    const { warrantyItems, maintenanceItems, onMarkComplete } = props;
    const [activeTab, setActiveTab] = useState('warranty');
    const { t } = useLanguage();

    const renderItem = (item: any, type: 'warranty' | 'maintenance') => (
        <div key={item.invoice.id} className="flex items-start gap-4" style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', backgroundColor: type === 'warranty' ? 'hsla(217, 91%, 60%, 0.1)' : 'hsla(45, 93%, 58%, 0.1)', color: type === 'warranty' ? 'var(--color-secondary)' : 'var(--color-warning)'}}>
                {type === 'warranty' ? ICONS.WARRANTY_CHECK : ICONS.MAINTENANCE}
            </div>
            <div style={{flexGrow: 1}}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{`${item.invoice.clientName} - ${item.invoice.vehicleLicensePlate}`}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.invoice.items.map((i: any) => i.description).join(', ')}>
                    {item.invoice.items.map((i: any) => i.description).join(', ')}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>{t('dashboard.pendingForDays', { days: item.days })}</p>
            </div>
            <button
                onClick={() => onMarkComplete(item.invoice.id)}
                className="btn btn-ghost"
                style={{ alignSelf: 'center', flexShrink: 0 }}
            >
                {t('dashboard.contacted')}
            </button>
        </div>
    );

    const itemsToDisplay = activeTab === 'warranty' ? warrantyItems : maintenanceItems;

    return (
        <div className="card" style={{padding: '1.5rem'}}>
            <h2 style={{color: 'var(--color-text-primary)'}}>{t('dashboard.followUp')}</h2>
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border)', margin: '1rem 0' }}>
                <button
                    onClick={() => setActiveTab('warranty')}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', borderBottom: activeTab === 'warranty' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'warranty' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none'}}
                >
                    {t('dashboard.warranty')} <span style={{ marginLeft: '0.5rem', backgroundColor: 'hsla(217, 91%, 60%, 0.2)', color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px'}}>{warrantyItems.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('maintenance')}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', borderBottom: activeTab === 'maintenance' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'maintenance' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none'}}
                >
                    {t('dashboard.maintenance')} <span style={{ marginLeft: '0.5rem', backgroundColor: 'hsla(45, 93%, 58%, 0.2)', color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px'}}>{maintenanceItems.length}</span>
                </button>
            </div>
            <div className="space-y-4" style={{ maxHeight: '24rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {itemsToDisplay.length > 0
                    ? itemsToDisplay.map((item: any) => renderItem(item, activeTab as any))
                    : <p style={{textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem 0'}}>{t('dashboard.noPendingActions')}</p>
                }
            </div>
        </div>
    );
};

interface DashboardProps {
    stats: Record<string, number>;
    quickSaleDraft: Invoice;
    clients: Client[];
    services: Service[];
    parts: Part[];
    followUpItems: { warranty: any[], maintenance: any[] };
    hasPermission: (p: Permission) => boolean;
    activeUser: User;
    onQuickSaleUpdate: (field: keyof Invoice, value: any) => void;
    onQuickSaleAddItem: (item: InvoiceItem) => void;
    onQuickSaleRemoveItem: (id: string) => void;
    onClearQuickSale: () => void;
    onFinalizeQuickSale: () => void;
    onAddClient: () => void;
    onAddCustomItem: () => void;
    onMarkFollowUpComplete: (invoiceId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props: DashboardProps) => {
    const {
        stats, 
        quickSaleDraft, 
        onQuickSaleUpdate, 
        onQuickSaleAddItem, 
        onQuickSaleRemoveItem, 
        onClearQuickSale, 
        onFinalizeQuickSale,
        onAddCustomItem, 
        onAddClient, 
        clients, 
        services, 
        parts, 
        followUpItems, 
        onMarkFollowUpComplete, 
        hasPermission, 
        activeUser
    } = props;

    const statIcons: Record<string, React.ReactNode> = {
        'Clientes Registados': ICONS.CLIENTS,
        'Viaturas Registadas': ICONS.VEHICLES,
        'Total Recebido': ICONS.PAYMENT,
        'Lucro Bruto': ICONS.REPORTS,
    };

    const { t } = useLanguage();
    const { formatCurrency: formatCurrencyWithCurrency } = useCurrency();

    return (
         <div className="space-y-8">
            <h1>{t('dashboard.title')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {hasPermission('view_dashboard_financials') && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            {Object.entries(stats).map(([key, value]) => {
                                const isCurrency = !['Clientes Registados', 'Viaturas Registadas'].includes(key);
                                const valueColorClass = ((value as number) < 0 && isCurrency) ? 'text-[var(--color-danger)]' : isCurrency ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]';

                                return (
                                    <div key={key} className="card" style={{ padding: '1.5rem' }}>
                                        <div className="flex items-center gap-4">
                                            <div style={{ color: 'var(--color-secondary)', backgroundColor: 'hsla(var(--color-secondary-hsl), 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)'}}>
                                                {statIcons[key]}
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{key}</h2>
                                                <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2 }} className={valueColorClass}>
                                                    {isCurrency ? formatCurrencyWithCurrency(value) : String(value)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <FollowUp
                        warrantyItems={followUpItems.warranty}
                        maintenanceItems={followUpItems.maintenance}
                        onMarkComplete={onMarkFollowUpComplete}
                    />
                </div>
                
                <div className="lg:col-span-4">
                    <QuickSale 
                        draft={quickSaleDraft}
                        onUpdate={onQuickSaleUpdate}
                        onAddItem={onQuickSaleAddItem}
                        onRemoveItem={onQuickSaleRemoveItem}
                        onClear={onClearQuickSale}
                        onFinalize={onFinalizeQuickSale}
                        clients={clients}
                        services={services}
                        parts={parts}
                        onAddCustomItem={onAddCustomItem}
                        onAddClient={onAddClient}
                        activeUser={activeUser}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;