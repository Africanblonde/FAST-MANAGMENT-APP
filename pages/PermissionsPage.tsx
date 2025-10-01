import React from 'react';
import type { Role, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';

interface PermissionsPageProps {
    roles: Role[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}

const PermissionsPage: React.FC<PermissionsPageProps> = (props: PermissionsPageProps) => {
    const { roles, onAdd, onEdit, onDelete, hasPermission } = props;
    
    return (
        <GenericManagementPage<Role>
            title="Perfis & Permissões"
            items={roles}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="roles"
            renderItem={(item: Role) => (
                <>
                    <h3 style={{fontSize: '1.125rem'}}>{item.name}</h3>
                    <p style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem'}}>{(item.permissions as Permission[]).length} permissões</p>
                </>
            )}
        />
    );
};

export default PermissionsPage;