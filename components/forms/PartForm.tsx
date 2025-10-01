import React, { useState } from 'react';
import type { Part, Supplier } from '../../types';

interface PartFormProps {
    item: Partial<Part>;
    onSave: (part: Part) => void;
    onCancel: () => void;
    suppliers: Supplier[];
}

// Use função regular com props tipadas explicitamente
const PartForm = (props: PartFormProps) => {
    const { item, onSave, onCancel, suppliers } = props;
    const [part, setPart] = useState<Partial<Part>>(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['quantity', 'purchasePrice', 'salePrice'].includes(name);
        setPart((prev: Partial<Part>) => ({...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(part as Part);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="name" 
                value={part.name || ''} 
                onChange={handleChange} 
                placeholder="Nome da Peça/Óleo" 
                required 
                className="form-input"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input 
                    name="brand" 
                    value={part.brand || ''} 
                    onChange={handleChange} 
                    placeholder="Marca" 
                    className="form-input"
                />
                 <input 
                    name="partNumber" 
                    value={part.partNumber || ''} 
                    onChange={handleChange} 
                    placeholder="Part Number / Referência" 
                    className="form-input"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                    name="quantity" 
                    type="number" 
                    value={part.quantity ?? ''} 
                    onChange={handleChange} 
                    placeholder="Stock" 
                    required 
                    className="form-input"
                />
                <input 
                    name="purchasePrice" 
                    type="number" 
                    step="0.01" 
                    value={part.purchasePrice ?? ''} 
                    onChange={handleChange} 
                    placeholder="Preço de Compra" 
                    required 
                    className="form-input"
                />
                <input 
                    name="salePrice" 
                    type="number" 
                    step="0.01" 
                    value={part.salePrice ?? ''} 
                    onChange={handleChange} 
                    placeholder="Preço de Venda" 
                    required 
                    className="form-input"
                />
            </div>
            <select 
                name="supplierId" 
                value={part.supplierId || ''} 
                onChange={handleChange} 
                className="form-select"
            >
                <option value="">-- Fornecedor (Opcional) --</option>
                {suppliers.map((s: Supplier) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <textarea 
                name="notes" 
                value={part.notes || ''} 
                onChange={handleChange} 
                placeholder="Notas Adicionais" 
                rows={3} 
                className="form-textarea"
            />
            
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default PartForm;