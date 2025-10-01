import React from 'react';
import type { Employee, SalaryAdvance, Permission } from '../types';
import { formatCurrency } from '../utils/helpers';

interface EmployeesPageProps {
    employees: Employee[];
    salaryAdvances: SalaryAdvance[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onNewAdvance: () => void;
    hasPermission: (p: Permission) => boolean;
}

const EmployeesPage: React.FC<EmployeesPageProps> = (props: EmployeesPageProps) => {
    const { employees, salaryAdvances, onAdd, onEdit, onDelete, onNewAdvance, hasPermission } = props;
    
    const adminStaff = employees.filter((e: Employee) => e.role === 'Administração');
    const mechanics = employees.filter((e: Employee) => e.role === 'Mecânico');

    const renderEmployeeCard = (employee: Employee) => (
        <div key={employee.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.125rem' }}>{employee.name}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{employee.role}</p>
                <p style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: '0.5rem' }}>{formatCurrency(employee.salary)} / mês</p>
            </div>
            {hasPermission('manage_employees') && (
                <div className="flex justify-end gap-2" style={{ padding: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <button onClick={() => onEdit(employee.id)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                    <button onClick={() => onDelete(employee.id)} className="btn-icon" style={{color: 'var(--color-danger)'}} title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1>Funcionários</h1>
                {hasPermission('manage_employees') && (
                    <div className="flex gap-4">
                        <button onClick={onNewAdvance} className="btn btn-warning">Adiantamento</button>
                        <button onClick={onAdd} className="btn btn-primary">Adicionar Funcionário</button>
                    </div>
                )}
            </div>
            
            <div>
                <h2>Administração</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{marginTop: '1rem'}}>
                    {adminStaff.length > 0 ? adminStaff.map(renderEmployeeCard) : <p style={{color: 'var(--color-text-secondary)', gridColumn: '1 / -1'}}>Nenhum funcionário administrativo.</p>}
                </div>
            </div>

            <div>
                <h2 style={{marginTop: '2rem'}}>Mecânicos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{marginTop: '1rem'}}>
                    {mechanics.length > 0 ? mechanics.map(renderEmployeeCard) : <p style={{color: 'var(--color-text-secondary)', gridColumn: '1 / -1'}}>Nenhum mecânico.</p>}
                </div>
            </div>

            <div style={{marginTop: '3rem'}}>
                <h2>Registo de Adiantamentos</h2>
                <div className="card table-wrapper" style={{marginTop: '1rem'}}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Funcionário</th>
                                <th style={{textAlign: 'right'}}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryAdvances.length > 0 ? (
                                [...salaryAdvances].sort((a: SalaryAdvance, b: SalaryAdvance) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((advance: SalaryAdvance) => {
                                    const employee = employees.find((e: Employee) => e.id === advance.employeeId);
                                    return (
                                        <tr key={advance.id}>
                                            <td>{new Date(advance.date).toLocaleDateString()}</td>
                                            <td>{employee?.name || 'Funcionário não encontrado'}</td>
                                            <td style={{textAlign: 'right', fontWeight: 600}}>{formatCurrency(advance.amount)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} style={{textAlign: 'center', padding: '2rem'}}>Nenhum adiantamento registado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeesPage;