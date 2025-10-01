
import React, { useState } from 'react';
import type { AssetCategory } from '../../types';

interface AssetCategoryFormProps {
    item: Partial<AssetCategory>;
    onSave: (category: AssetCategory) => void;
    onCancel: () => void;
}

const AssetCategoryForm: React.FC<AssetCategoryFormProps> = ({ item, onSave, onCancel }) => {
    const [category, setCategory] = useState(item);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(category as AssetCategory);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="name" 
                value={category.name || ''} 
                onChange={(e) => setCategory(prev => ({...prev, name: e.target.value}))}
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