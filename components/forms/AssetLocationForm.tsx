import React, { useState } from 'react';
import type { AssetLocation } from '../../types';

interface AssetLocationFormProps {
    item: Partial<AssetLocation>;
    onSave: (location: AssetLocation) => void;
    onCancel: () => void;
}

const AssetLocationForm = ({ item, onSave, onCancel }: AssetLocationFormProps) => {
    const [location, setLocation] = useState<Partial<AssetLocation>>(item);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation((prev: Partial<AssetLocation>) => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(location as AssetLocation);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="name" 
                value={location.name || ''} 
                onChange={handleChange}
                placeholder="Nome da Localização (ex: Oficina Principal)" 
                required 
                className="form-input"
            />
            <input 
                name="responsible" 
                value={location.responsible || ''} 
                onChange={handleChange}
                placeholder="Responsável (Opcional)" 
                className="form-input"
            />
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default AssetLocationForm;