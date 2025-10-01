
import React, { useState } from 'react';
import type { Role } from '../../types';

interface UserFormProps {
    onSave: (data: { name: string, email: string, password: string, roleId: string }) => void;
    onCancel: () => void;
    roles: Role[];
}

const UserForm: React.FC<UserFormProps> = ({ onSave, onCancel, roles }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        roleId: roles.find(r => r.name === 'Gestão')?.id || '' 
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!formData.roleId) {
            setError('Por favor, selecione um perfil para o utilizador.');
            return;
        }
        setError('');
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded-md">{error}</p>}
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo do Utilizador" required className="form-input" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="form-input" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password (mínimo 6 caracteres)" required className="form-input" />
            <select name="roleId" value={formData.roleId} onChange={handleChange} required className="form-input">
                <option value="">-- Selecione um Perfil --</option>
                {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                ))}
            </select>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button type="button" onClick={onCancel} className="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Utilizador</button>
            </div>
        </form>
    );
};

export default UserForm;