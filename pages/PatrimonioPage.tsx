import React, { useState, useMemo, ChangeEvent } from 'react';
import type { Asset, Permission, AssetCategory, AssetLocation, Supplier } from '../types';
import { formatCurrency, exportToCsv } from '../utils/helpers';
import { ICONS } from '../constants';

interface PatrimonioPageProps {
    assets: Asset[];
    categories: AssetCategory[];
    locations: AssetLocation[];
    suppliers: Supplier[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
    setActivePage: (page: string) => void;
}

const PatrimonioPage: React.FC<PatrimonioPageProps> = (props: PatrimonioPageProps) => {
    const { 
        assets, 
        categories, 
        locations, 
        suppliers, 
        onAdd, 
        onEdit, 
        onDelete, 
        hasPermission, 
        setActivePage 
    } = props;

    const [categoryFilter, setCategoryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const summaryStats = useMemo(() => {
        return {
            totalItems: assets.reduce((sum: number, asset: Asset) => sum + asset.quantity, 0),
            totalValue: assets.reduce((sum: number, asset: Asset) => sum + (asset.purchasePrice || 0) * asset.quantity, 0),
            activeItems: assets.filter((a: Asset) => a.status === 'Ativo').reduce((sum: number, asset: Asset) => sum + asset.quantity, 0),
            inMaintenanceItems: assets.filter((a: Asset) => a.status === 'Em Manutenção').reduce((sum: number, asset: Asset) => sum + asset.quantity, 0),
        };
    }, [assets]);
    
    const filteredAssets = useMemo(() => {
        return assets.filter((asset: Asset) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (categoryFilter === '' || asset.categoryId === categoryFilter) &&
                (locationFilter === '' || asset.locationId === locationFilter) &&
                (statusFilter === '' || asset.status === statusFilter) &&
                (asset.name.toLowerCase().includes(searchLower) ||
                 (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchLower)) ||
                 (asset.model && asset.model.toLowerCase().includes(searchLower)))
            );
        });
    }, [assets, categoryFilter, locationFilter, statusFilter, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredAssets.map((asset: Asset) => ({
            'Nome': asset.name,
            'Modelo': asset.model || '',
            'Nº Série': asset.serialNumber || '',
            'Categoria': categories.find((c: AssetCategory) => c.id === asset.categoryId)?.name || 'N/A',
            'Localização': locations.find((l: AssetLocation) => l.id === asset.locationId)?.name || 'N/A',
            'Fornecedor': suppliers.find((s: Supplier) => s.id === asset.supplierId)?.name || 'N/A',
            'Data Aquisição': asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '',
            'Valor Aquisição': asset.purchasePrice || 0,
            'Quantidade': asset.quantity,
            'Estado': asset.status,
            'Notas': asset.description || '',
        }));
        exportToCsv(`patrimonio-${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
    };

    const renderAssetCard = (item: Asset) => {
        const category = categories.find((c: AssetCategory) => c.id === item.categoryId)?.name || 'N/A';
        const location = locations.find((l: AssetLocation) => l.id === item.locationId)?.name || 'N/A';
        const statusStyles: Record<string, React.CSSProperties> = { 
            'Ativo': { backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)' },
            'Inativo': { backgroundColor: 'hsla(215, 16%, 55%, 0.1)', color: 'var(--color-text-tertiary)' },
            'Em Manutenção': { backgroundColor: 'hsla(45, 93%, 58%, 0.1)', color: 'var(--color-warning)' }
        };

        return (
             <div key={item.id} className="card flex flex-col justify-between">
                <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-white pr-2">{item.name} <span className="text-sm font-normal text-slate-400">({item.quantity}x)</span></h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0`} style={statusStyles[item.status]}>{item.status}</span>
                    </div>
                    <p className="text-sm text-slate-400 flex items-center gap-2">{ICONS.CATEGORIES} {category}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-2">{ICONS.LOCATIONS} {location}</p>
                     <div className="pt-2 border-t border-slate-700/50">
                         <p className="text-xl font-bold text-[var(--color-success)] text-right">{formatCurrency((item.purchasePrice || 0) * item.quantity)}</p>
                    </div>
                </div>
                {hasPermission('manage_assets') && (
                    <div className="flex justify-end gap-1 p-2 border-t border-slate-700/50 bg-[hsla(220,26%,12%,0.5)] rounded-b-lg">
                        <button onClick={() => onEdit(item.id)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        <button onClick={() => onDelete(item.id)} className="btn-icon" style={{color: 'var(--color-danger)'}} title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                )}
            </div>
        )
    }

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value);
    const handleLocationChange = (e: ChangeEvent<HTMLSelectElement>) => setLocationFilter(e.target.value);
    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1>Gestão de Património</h1>
                <div className="flex gap-2 flex-wrap">
                    {hasPermission('manage_assets') && (
                        <>
                            <button onClick={() => setActivePage('asset_categories')} className="btn btn-ghost">Gerir Categorias</button>
                            <button onClick={() => setActivePage('asset_locations')} className="btn btn-ghost">Gerir Localizações</button>
                            <button onClick={onAdd} className="btn btn-primary">Adicionar Item</button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="card p-4"><h2 className="text-slate-400 text-sm">Total de Itens</h2><p className="text-2xl font-bold">{summaryStats.totalItems}</p></div>
                <div className="card p-4"><h2 className="text-slate-400 text-sm">Valor Total</h2><p className="text-2xl font-bold text-[var(--color-success)]">{formatCurrency(summaryStats.totalValue)}</p></div>
                 <div className="card p-4"><h2 className="text-slate-400 text-sm">Itens Ativos</h2><p className="text-2xl font-bold">{summaryStats.activeItems}</p></div>
                 <div className="card p-4"><h2 className="text-slate-400 text-sm">Em Manutenção</h2><p className="text-2xl font-bold text-[var(--color-warning)]">{summaryStats.inMaintenanceItems}</p></div>
            </div>
            
            <div className="card p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={handleSearchChange} className="lg:col-span-2 form-input" />
                    <select value={categoryFilter} onChange={handleCategoryChange} className="form-select">
                        <option value="">Todas Categorias</option>
                        {categories.map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={locationFilter} onChange={handleLocationChange} className="form-select">
                        <option value="">Todas Localizações</option>
                        {locations.map((l: AssetLocation) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={handleStatusChange} className="form-select">
                        <option value="">Todos Estados</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                    </select>
                </div>
                 <button onClick={handleExport} className="btn btn-ghost text-sm">Exportar para CSV</button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.length > 0 ? (
                    filteredAssets.map(renderAssetCard)
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center card p-12">
                         <p className="text-slate-400">Nenhum item encontrado com os filtros atuais.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatrimonioPage;