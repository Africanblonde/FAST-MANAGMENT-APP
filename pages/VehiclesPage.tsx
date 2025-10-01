import React from 'react';
import type { Client, Vehicle, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';

interface VehiclesPageProps {
    vehicles: Vehicle[];
    clients: Client[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}

const VehiclesPage = ({ vehicles, clients, onAdd, onEdit, onDelete, hasPermission }: VehiclesPageProps) => {
    return (
        <GenericManagementPage<Vehicle>
            title="Viaturas"
            items={vehicles}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="vehicles"
            renderItem={(item) => {
                const client = clients.find((c: Client) => c.id === item.clientId);
                return (
                    <>
                        <h3 style={{fontSize: '1.125rem'}}>{item.licensePlate}</h3>
                        <p style={{color: 'var(--color-text-secondary)'}}>{item.model}</p>
                        {client && <p style={{fontSize: '0.875rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem'}}>Proprietário: {`${client.firstName} ${client.lastName}`.trim()}</p>}
                    </>
                );
            }}
        />
    );
};

export default VehiclesPage;