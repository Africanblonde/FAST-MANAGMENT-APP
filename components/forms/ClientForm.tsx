import React, { useState } from 'react';
import type { Client, Vehicle } from '../../types';

interface ClientFormProps {
    item: Partial<Client & Vehicle>;
    clients: Client[]; // Add clients prop for duplicate checking
    onSave: (data: Partial<Client & Vehicle>) => void;
    onCancel: () => void;
}

const ClientForm = ({ item, clients, onSave, onCancel }: ClientFormProps) => {
    const isNew = !item.id;
    const [formData, setFormData] = useState({
        firstName: item.firstName || '',
        middleName: item.middleName || '',
        lastName: item.lastName || '',
        contact: item.contact || '',
        licensePlate: item.licensePlate || '',
        model: item.model || '',
        type: item.type || 'Ligeiro'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const contactRegex = /^(8[2-7])\d{7}$/;

        if (!formData.firstName.trim()) newErrors.firstName = "O primeiro nome é obrigatório.";
        if (!formData.lastName.trim()) newErrors.lastName = "O apelido é obrigatório.";
        if (!formData.contact.trim()) {
            newErrors.contact = "O contacto é obrigatório.";
        } else if (!contactRegex.test(formData.contact)) {
            newErrors.contact = "Contacto inválido. Deve ter 9 dígitos e começar com 82, 83, 84, 85, 86 ou 87.";
        } else {
            const isDuplicate = clients.some(
                (c: Client) => c.contact === formData.contact && c.id !== item.id
            );
            if (isDuplicate) {
                newErrors.contact = "Este contacto já está registado noutro cliente.";
            }
        }
        
        if (isNew && formData.licensePlate.trim() && !formData.model.trim()) {
            newErrors.model = "O modelo é obrigatório se a matrícula for preenchida.";
        }
        if (isNew && formData.model.trim() && !formData.licensePlate.trim()) {
            newErrors.licensePlate = "A matrícula é obrigatória se o modelo for preenchido.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({...prev, [name]: value})); // CORREÇÃO AQUI
        if (errors[name]) {
            setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' })); // CORREÇÃO AQUI
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        onSave({
            ...item,
            ...formData,
            firstName: formData.firstName.trim(),
            middleName: formData.middleName.trim(),
            lastName: formData.lastName.trim(),
            contact: formData.contact.trim(),
        });
    };

    const ErrorMessage = ({ name }: { name: string }) => {
        return errors[name] ? <p className="text-sm text-red-400 mt-1">{errors[name]}</p> : null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Primeiro Nome" required className="form-input"/>
                <ErrorMessage name="firstName" />
            </div>
            <input name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Nomes do Meio (opcional)" className="form-input"/>
            <div>
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apelido" required className="form-input"/>
                <ErrorMessage name="lastName" />
            </div>
            <div>
                <input name="contact" type="tel" value={formData.contact} onChange={handleChange} placeholder="Contacto (9 dígitos)" required maxLength={9} pattern="8[2-7][0-9]{7}" title="O contacto deve ter 9 dígitos e começar com 82-87." className="form-input"/>
                <ErrorMessage name="contact" />
            </div>
            
            {isNew && (
                <div className="pt-4 mt-4 border-t border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-3">Adicionar Viatura (Opcional)</h3>
                    <div className="space-y-4">
                        <div>
                            <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="Matrícula" className="form-input" onInput={(e: React.FormEvent<HTMLInputElement>) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}/>
                            <ErrorMessage name="licensePlate" />
                        </div>
                        <div>
                            <input name="model" value={formData.model} onChange={handleChange} placeholder="Modelo do Veículo" className="form-input"/>
                            <ErrorMessage name="model" />
                        </div>
                         <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                            <option value="Ligeiro">Ligeiro</option>
                            <option value="Pesado">Pesado</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default ClientForm;