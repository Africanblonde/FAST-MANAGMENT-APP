import React, { useMemo } from 'react';
import type { Client, Invoice } from '../types';
import { formatCurrency, getInvoiceStatusAndBalance } from '../utils/helpers';

interface Props {
    clients: Client[];
    invoices: Invoice[];
    onPayInvoice: (id: string) => void;
    onViewInvoice: (id: string, isCollection: boolean) => void;
}

type ClientWithDebt = Client & {
    totalDebt: number;
    pendingInvoices: Invoice[];
};

const ClientCreditPage: React.FC<Props> = (props: Props) => {
    const { clients, invoices, onPayInvoice, onViewInvoice } = props;
    
    const clientsWithDebt: ClientWithDebt[] = useMemo(() => {
        return clients.map((client: Client) => {
            const clientInvoices = invoices.filter((inv: Invoice) => inv.clientId === client.id);
            const pendingInvoices = clientInvoices.filter((inv: Invoice) => getInvoiceStatusAndBalance(inv).balance > 0.01);
            const totalDebt = pendingInvoices.reduce((sum: number, inv: Invoice) => sum + getInvoiceStatusAndBalance(inv).balance, 0);
            
            return {
                ...client,
                totalDebt,
                pendingInvoices
            };
        }).filter((c: ClientWithDebt) => c.totalDebt > 0).sort((a: ClientWithDebt, b: ClientWithDebt) => b.totalDebt - a.totalDebt);

    }, [clients, invoices]);
    
    return (
        <div className="space-y-8">
            <h1>Crédito de Clientes</h1>
            
            <div className="space-y-6">
                {clientsWithDebt.length === 0 ? (
                     <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum cliente com dívidas pendentes.</p>
                     </div>
                ) : (
                    clientsWithDebt.map((client: ClientWithDebt) => (
                        <div key={client.id} className="card" style={{ padding: '1.5rem' }}>
                            <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem' }}>{`${client.firstName} ${client.lastName}`.trim()}</h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>{client.contact}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                     <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Dívida Total</p>
                                     <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatCurrency(client.totalDebt)}</p>
                                </div>
                            </div>
                            <div className="space-y-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Faturas Pendentes:</h4>
                                {client.pendingInvoices.map((invoice: Invoice) => {
                                    const { balance } = getInvoiceStatusAndBalance(invoice);
                                    return (
                                         <div key={invoice.id} style={{ backgroundColor: 'var(--color-background)', padding: '0.75rem', borderRadius: 'var(--radius-md)'}} className="flex justify-between items-center flex-wrap gap-2">
                                            <div>
                                                <p style={{ fontWeight: 600 }}>Fatura #{invoice.display_id || invoice.id} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)'}}>({new Date(invoice.issueDate).toLocaleDateString()})</span></p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>Em dívida: {formatCurrency(balance)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onViewInvoice(invoice.id, true)} className="btn btn-ghost" style={{padding: '0.5rem 1rem'}}>Ver</button>
                                                <button onClick={() => onPayInvoice(invoice.id)} className="btn" style={{backgroundColor: 'var(--color-success)', padding: '0.5rem 1rem'}}>Pagar</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientCreditPage;