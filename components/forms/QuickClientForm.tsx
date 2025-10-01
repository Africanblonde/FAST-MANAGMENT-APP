

import React, { useState } from 'react';

interface QuickClientFormProps {
    onSave: (data: { firstName: string, lastName: string, contact: string, model: string, licensePlate: string }) => void;
    onCancel: () => void;
}

const QuickClientForm: React.FC<QuickClientFormProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', contact: '', model: '', licensePlate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.firstName || !formData.lastName || !formData.contact || !formData.model || !formData.licensePlate) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        if(!/^\d{9}$/.test(formData.contact)){
             alert("O contacto deve ter 9 dígitos.");
             return;
        }
        onSave(formData);
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Primeiro Nome" required className="w-full p-2 bg-slate-700 rounded"/>
                 <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apelido" required className="w-full p-2 bg-slate-700 rounded"/>
            </div>
            <input name="contact" type="tel" value={formData.contact} onChange={handleChange} placeholder="Contacto (9 dígitos)" required maxLength={9} pattern="\d{9}" title="O contacto deve ter 9 dígitos." className="w-full p-2 bg-slate-700 rounded"/>
            <div className="pt-4 mt-4 border-t border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-3">Dados da Viatura</h3>
                <div className="space-y-4">
                    <input name="model" value={formData.model} onChange={handleChange} placeholder="Marca e Modelo" required className="w-full p-2 bg-slate-700 rounded"/>
                    <input name="licensePlate" value={formData.licensePlate} onChange={e => setFormData(prev => ({...prev, licensePlate: e.target.value.toUpperCase()}))} placeholder="Matrícula" required className="w-full p-2 bg-slate-700 rounded"/>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Guardar Cliente</button>
            </div>
        </form>
    );
};

export default QuickClientForm;