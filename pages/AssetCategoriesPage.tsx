import React from 'react';
import type { AssetCategory, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';

const AssetCategoriesPage: React.FC<{
    categories: AssetCategory[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
    setActivePage: (page: string) => void;
}> = ({ categories, onAdd, onEdit, onDelete, hasPermission, setActivePage }) => {
    return (
        <GenericManagementPage<AssetCategory>
            title="Categorias de Património"
            items={categories}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="assets"
            customHeaderButtons={
                <button onClick={() => setActivePage('assets')} className="btn bg-slate-600 hover:bg-slate-500">
                    Voltar para Património
                </button>
            }
            renderItem={item => (
                <p className="font-bold text-lg text-white">{item.name}</p>
            )}
        />
    );
};

export default AssetCategoriesPage;