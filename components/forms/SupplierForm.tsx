

import React, { useState } from 'react';
import type { Supplier } from '../../types';

interface SupplierFormProps {
    item: Partial<Supplier>;
    onSave: (supplier: Supplier) => void;
    onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ item, onSave, onCancel }) => {
    const [supplier, setSupplier] = useState(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupplier(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(supplier as Supplier);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={supplier.name || ''} onChange={handleChange} placeholder="Nome do Fornecedor" required className="form-input"/>
            <input name="contact" value={supplier.contact || ''} onChange={handleChange} placeholder="Contacto" required className="form-input"/>
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default SupplierForm;