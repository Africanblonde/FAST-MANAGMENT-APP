import React, { useState } from 'react';
import type { Employee } from '../../types';

interface EmployeeFormProps {
  item: Partial<Employee>;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = (props: EmployeeFormProps) => {
  const { item, onSave, onCancel } = props;

  const [employee, setEmployee] = useState<Partial<Employee>>(item);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEmployee((prev: Partial<Employee>) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // assume que onSave espera Employee completo; o cast é intencional
    onSave(employee as Employee);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={employee.name || ''}
        onChange={handleChange}
        placeholder="Nome Completo"
        required
        className="form-input"
      />
      <input
        name="salary"
        type="number"
        step="0.01"
        value={employee.salary ?? ''}
        onChange={handleChange}
        placeholder="Salário Base (MT)"
        required
        className="form-input"
      />
      <select
        name="role"
        value={employee.role || 'Mecânico'}
        onChange={handleChange}
        required
        className="form-select"
      >
        <option value="Mecânico">Mecânico</option>
        <option value="Administração">Administração</option>
      </select>

      <div className="flex justify-end gap-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
        <button type="submit" className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
};

export default EmployeeForm;
