import React from 'react';
import type { Client, Permission, Vehicle } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';
import { ICONS } from '../constants';

const ClientsPage = ({
    clients,
    vehicles,
    onAdd,
    onEdit,
    onDelete,
    hasPermission,
    onViewFinancials
}: {
    clients: Client[];
    vehicles: Vehicle[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
    onViewFinancials: (client: Client) => void;
}) => {
    return (
        <GenericManagementPage<Client>
            title="Clientes"
            items={clients}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="clients"
            renderItem={(item) => {
                const clientVehicles = vehicles.filter((v: Vehicle) => v.clientId === item.id);
                return (
                    <>
                        <h3 style={{ fontSize: '1.125rem' }}>{`${item.firstName} ${item.lastName}`.trim()}</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>{item.contact}</p>
                        {clientVehicles.length > 0 && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>Viaturas:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {clientVehicles.map((v: Vehicle) => (
                                        <span key={v.id} style={{ 
                                            backgroundColor: 'var(--color-background)',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '0.75rem', fontWeight: 500, 
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            {v.licensePlate}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                );
            }}
            renderExtraActions={(item) => (
                <button
                    onClick={() => onViewFinancials(item)}
                    className="btn-icon"
                    title="Ver Histórico Financeiro"
                >
                    {ICONS.STATEMENT}
                </button>
            )}
        />
    );
};

export default ClientsPage;