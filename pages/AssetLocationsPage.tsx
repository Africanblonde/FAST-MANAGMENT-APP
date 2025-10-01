import React from 'react';
import type { AssetLocation, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';

interface Props {
    locations: AssetLocation[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
    setActivePage: (page: string) => void;
}

const AssetLocationsPage: React.FC<Props> = (props: Props) => {
    const { locations, onAdd, onEdit, onDelete, hasPermission, setActivePage } = props;
    
    return (
        <GenericManagementPage<AssetLocation>
            title="Localizações do Património"
            items={locations}
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
            renderItem={(item: AssetLocation) => (
                <>
                    <p className="font-bold text-lg text-white">{item.name}</p>
                    {item.responsible && <p className="text-slate-400">Responsável: {item.responsible}</p>}
                </>
            )}
        />
    );
};

export default AssetLocationsPage;