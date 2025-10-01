import React from 'react';
import type { Service, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';
import { formatCurrency } from '../utils/helpers';

const ServicesPage: React.FC<{
    services: Service[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}> = ({ services, onAdd, onEdit, onDelete, hasPermission }) => {
    return (
        <GenericManagementPage<Service>
            title="Serviços"
            items={services}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="services"
            renderItem={item => (
                <>
                    <h3 style={{fontSize: '1.125rem'}}>{item.name}</h3>
                    <p style={{color: 'var(--color-success)', fontWeight: 600}}>{formatCurrency(item.price)}</p>
                </>
            )}
        />
    );
};

export default ServicesPage;