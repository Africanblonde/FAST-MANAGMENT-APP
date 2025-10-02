import React from 'react';
import type { AssetCategory, Permission } from '../types';
import GenericManagementPage from '../GenericManagementPage';

interface AssetCategoriesPageProps {
    categories: AssetCategory[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
    setActivePage: (page: string) => void;
}

// Removido React.FC e tipado diretamente
const AssetCategoriesPage = ({ categories, onAdd, onEdit, onDelete, hasPermission, setActivePage }: AssetCategoriesPageProps) => {
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
            renderItem={(item: AssetCategory) => (
                <p className="font-bold text-lg text-white">{item.name}</p>
            )}
        />
    );
};

export default AssetCategoriesPage;
