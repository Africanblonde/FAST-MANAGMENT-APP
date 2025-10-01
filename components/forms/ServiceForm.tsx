import React, { useState } from 'react';
import type { Service } from '../../types';

interface ServiceFormProps {
    item: Partial<Service>;
    onSave: (service: Partial<Service>) => void;
    onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ item, onSave, onCancel }) => {
    const [service, setService] = useState({
        name: item.name || '',
        price: item.price ?? '',
        type: item.type || 'Geral',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setService(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...item,
            ...service,
            price: parseFloat(service.price as string) || 0,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={service.name} onChange={handleChange} placeholder="Nome do Serviço" required className="form-input"/>
            <input name="price" type="number" step="0.01" value={service.price} onChange={handleChange} placeholder="Preço" required className="form-input"/>
            <select name="type" value={service.type} onChange={handleChange} required className="form-select">
                <option value="Geral">Geral</option>
                <option value="Ligeiro">Ligeiro</option>
                <option value="Pesado">Pesado</option>
            </select>
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default ServiceForm;