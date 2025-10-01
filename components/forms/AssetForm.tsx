import React, { useState } from 'react';
import type { Asset, AssetCategory, AssetLocation, Supplier } from '../../types';

interface AssetFormProps {
    item: Partial<Asset>;
    onSave: (asset: Asset) => void;
    onCancel: () => void;
    categories: AssetCategory[];
    locations: AssetLocation[];
    suppliers: Supplier[];
}

const AssetForm = ({ item, onSave, onCancel, categories, locations, suppliers }: AssetFormProps) => {
    const [asset, setAsset] = useState<Partial<Asset>>(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setAsset((prev: Partial<Asset>) => ({...prev, [name]: parsedValue }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAsset((prev: Partial<Asset>) => ({ ...prev, purchaseDate: new Date(e.target.value).toISOString() }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(asset as Asset);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={asset.name || ''} onChange={handleChange} placeholder="Descrição do Item" required className="form-input"/>
                <input name="model" value={asset.model || ''} onChange={handleChange} placeholder="Modelo" className="form-input"/>
                <input name="serialNumber" value={asset.serialNumber || ''} onChange={handleChange} placeholder="Número de Série" className="form-input"/>
                <input name="quantity" type="number" value={asset.quantity ?? ''} onChange={handleChange} placeholder="Quantidade" required className="form-input"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <select name="categoryId" value={asset.categoryId || ''} onChange={handleChange} required className="form-select">
                    <option value="">Selecione a Categoria</option>
                    {categories.map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="locationId" value={asset.locationId || ''} onChange={handleChange} required className="form-select">
                    <option value="">Selecione a Localização</option>
                    {locations.map((l: AssetLocation) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
             <select name="status" value={asset.status || 'Ativo'} onChange={handleChange} required className="form-select">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Em Manutenção">Em Manutenção</option>
            </select>
            
            <div className="pt-4 mt-4 border-t border-slate-600 space-y-4">
                <h3 className="text-lg font-semibold text-white">Detalhes da Compra (Opcional)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="purchasePrice" type="number" step="0.01" value={asset.purchasePrice ?? ''} onChange={handleChange} placeholder="Valor de Aquisição" className="form-input"/>
                    <input type="date" name="purchaseDate" value={asset.purchaseDate?.split('T')[0] || ''} onChange={handleDateChange} className="form-input"/>
                </div>
                 <select name="supplierId" value={asset.supplierId || ''} onChange={handleChange} className="form-select">
                    <option value="">Selecione o Fornecedor (opcional)</option>
                    {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            <textarea name="description" value={asset.description || ''} onChange={handleChange} placeholder="Notas Adicionais" rows={3} className="form-textarea"/>
            
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default AssetForm;