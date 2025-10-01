import React, { useState } from 'react';

interface CustomItemFormProps {
    onSave: (data: { type: 'service' | 'part', description: string, unitPrice: number }) => void;
    onCancel: () => void;
}

const CustomItemForm = ({ onSave, onCancel }: CustomItemFormProps) => {
    const [item, setItem] = useState({
        type: 'service' as 'service' | 'part',
        description: '',
        unitPrice: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setItem((prev: typeof item) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(item.unitPrice);
        if(!item.description || isNaN(price) || price <= 0) {
            alert("Descrição e Preço de Venda são obrigatórios e o preço deve ser maior que zero.");
            return;
        }
        onSave({ type: item.type, description: item.description, unitPrice: price });
    };

    return (
        <div className="space-y-6">
            <div className="form-group">
                <label className="form-label">Tipo de Item</label>
                <select name="type" value={item.type} onChange={handleChange} className="form-select">
                    <option value="service">Prestação de Serviço</option>
                    <option value="part">Fornecimento de Acessório</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Descrição do Item</label>
                <input name="description" value={item.description} onChange={handleChange} placeholder="Descrição do Item" required className="form-input"/>
            </div>
            <div className="form-group">
                <label className="form-label">Preço de Venda (MT)</label>
                <input name="unitPrice" type="number" step="0.01" value={item.unitPrice} onChange={handleChange} placeholder="Preço de Venda (MT)" required className="form-input"/>
            </div>

            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="button" onClick={handleSubmit} className="btn btn-primary">Adicionar Item</button>
            </div>
        </div>
    );
};

export default CustomItemForm;