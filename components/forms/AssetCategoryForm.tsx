import React, { useState } from 'react';
import type { AssetCategory } from '../../types';

// Interface mais explícita
interface AssetCategoryFormProps {
    item: Partial<AssetCategory>;
    onSave: (category: AssetCategory) => void;
    onCancel: () => void;
}

// Correção: Tipar explicitamente as props na função
const AssetCategoryForm = ({ item, onSave, onCancel }: AssetCategoryFormProps) => {
    const [category, setCategory] = useState<Partial<AssetCategory>>(item);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(category as AssetCategory);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory((prev: Partial<AssetCategory>) => ({...prev, name: e.target.value}));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="name" 
                value={category.name || ''} 
                onChange={handleChange}
                placeholder="Nome da Categoria" 
                required 
                className="form-input"
            />
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default AssetCategoryForm;