import React, { useState } from 'react';
import type { Employee, SalaryAdvance } from '../../types';

interface SalaryAdvanceFormProps {
    onSave: (data: Pick<SalaryAdvance, 'employeeId' | 'amount' | 'date'>) => void;
    onCancel: () => void;
    employees: Employee[];
}

const SalaryAdvanceForm: React.FC<SalaryAdvanceFormProps> = ({ onSave, onCancel, employees }) => {
    const [advance, setAdvance] = useState({
        employeeId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setAdvance(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!advance.employeeId || !advance.amount) {
            alert("Por favor, selecione um funcionário e insira um valor.");
            return;
        }
        onSave({ ...advance, date: new Date(advance.date).toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <select name="employeeId" value={advance.employeeId} onChange={handleChange} required className="form-select">
                <option value="">-- Selecione o Funcionário --</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <input name="amount" type="number" step="0.01" value={advance.amount ?? ''} onChange={handleChange} placeholder="Valor do Adiantamento (MT)" required className="form-input"/>
            <input name="date" type="date" value={advance.date} onChange={handleChange} required className="form-input"/>
             <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default SalaryAdvanceForm;