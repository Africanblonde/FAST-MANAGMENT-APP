import React, { useState } from 'react';

// --- Tipos Locais (Substituindo '../../types') ---
type Employee = {
    id: string;
    name: string;
    // Adicionar outros campos de funcionário conforme necessário
};

type SalaryAdvance = {
    employeeId: string;
    amount: number;
    date: string; // ISO string
    // Adicionar outros campos como status, recordedBy, etc.
};

interface SalaryAdvanceFormProps {
    onSave: (data: Pick<SalaryAdvance, 'employeeId' | 'amount' | 'date'>) => void;
    onCancel: () => void;
    employees: Employee[];
}

// Tipo de Estado para uso interno do formulário
type AdvanceState = {
    employeeId: string;
    amount: number;
    date: string;
};

// CORREÇÃO: Aplicação direta da tipagem na desestruturação das props.
const SalaryAdvanceForm = ({ onSave, onCancel, employees }: SalaryAdvanceFormProps) => {
    
    // Inicializa o estado com tipagem explícita
    const [advance, setAdvance] = useState<AdvanceState>({
        employeeId: '',
        amount: 0,
        // Garante que o formato é YYYY-MM-DD para o input type="date"
        date: new Date().toISOString().split('T')[0], 
    });
    
    // Estado para exibir mensagens de erro (substituindo alert())
    const [error, setError] = useState<string | null>(null);

    // Tipagem explícita para o evento de mudança
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(null); // Limpa o erro ao digitar
        const { name, value, type } = e.target;
        
        // Tipagem explícita para o estado anterior (prev: AdvanceState)
        setAdvance((prev: AdvanceState) => {
            let newValue: string | number = value;
            if (type === 'number' || name === 'amount') {
                 // Converte para número, usa 0 se falhar a conversão
                newValue = parseFloat(value) || 0; 
            }
            return { ...prev, [name]: newValue };
        });
    };
    
    // Tipagem explícita para o evento de formulário
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!advance.employeeId) {
            setError("Por favor, selecione um funcionário.");
            return;
        }
        if (advance.amount <= 0) {
            setError("O valor do adiantamento deve ser superior a zero.");
            return;
        }

        // Garante que o formato da data é ISO string antes de salvar
        onSave({ 
            ...advance, 
            date: new Date(advance.date).toISOString() 
        });
    };

    // Classes de estilo Dark Mode (Tailwind)
    // Cores primárias de roxo/magenta para operações relacionadas a salários/RH
    const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out shadow-sm";
    const buttonClasses = "font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow-md";
    const primaryColor = 'purple'; 

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-slate-900 rounded-xl text-slate-100 shadow-lg max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-purple-400 border-b border-slate-700 pb-3">Registar Adiantamento Salarial</h2>
            
            {/* Display Error Message (Substituindo alert()) */}
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg animate-pulse">
                    {error}
                </div>
            )}

            {/* 1. Selecionar Funcionário */}
            <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-slate-300 mb-1">Funcionário</label>
                <select 
                    id="employeeId"
                    name="employeeId" 
                    value={advance.employeeId} 
                    onChange={handleChange} 
                    required 
                    className={`${inputClasses} appearance-none`}
                >
                    <option value="" disabled>-- Selecione o Funcionário --</option>
                    {/* Tipagem explícita para emp */}
                    {employees.map((emp: Employee) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
            </div>

            {/* 2. Valor do Adiantamento */}
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Valor</label>
                <div className="relative">
                    <input 
                        id="amount"
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        // Usa '' para que o placeholder apareça quando o valor é 0
                        value={advance.amount === 0 ? '' : advance.amount} 
                        onChange={handleChange} 
                        placeholder="0.00" 
                        required 
                        className={`${inputClasses} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">MT</span>
                </div>
            </div>

            {/* 3. Data */}
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Data do Adiantamento</label>
                <input 
                    id="date"
                    name="date" 
                    type="date" 
                    value={advance.date} 
                    onChange={handleChange} 
                    required 
                    className={inputClasses}
                />
            </div>
            
            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={`${buttonClasses} bg-slate-600 hover:bg-slate-500 text-white`}
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className={`${buttonClasses} bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white`}
                >
                    Guardar
                </button>
            </div>
        </form>
    );
};

export default SalaryAdvanceForm;
