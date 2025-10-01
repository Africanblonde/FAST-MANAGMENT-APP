import React, { useState } from 'react';

// --- Tipos Locais (Substituindo '../../types') ---
type PaymentMethod = {
    name: string;
    initialBalance: number;
    // Adicionar outras propriedades de método de pagamento, se existirem
};

// Interface para as Props do Componente
interface PaymentMethodFormProps {
    // Tipagem combinada: { originalName: string | null } AND Partial<PaymentMethod>
    item: { originalName: string | null } & Partial<PaymentMethod>; 
    onSave: (data: { originalName: string | null; newName: string; newBalance: number }) => void;
    onCancel: () => void;
}

// CORREÇÃO: Aplicar a tipagem diretamente à desestruturação das props.
const PaymentMethodForm = ({ item, onSave, onCancel }: PaymentMethodFormProps) => {
    // Usar 'string' e 'number' explicitamente para o estado
    const [name, setName] = useState<string>(item.name || '');
    const [balance, setBalance] = useState<number>(item.initialBalance ?? 0);

    // Tipagem explícita para o evento do formulário
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ originalName: item.originalName, newName: name, newBalance: balance });
    };
    
    // Classes de estilo dark mode para o formulário
    const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm";
    const buttonClasses = "font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow-md";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-slate-900 rounded-xl text-slate-100">
            <h2 className="text-2xl font-bold text-blue-400 border-b border-slate-700 pb-2">Detalhes do Método de Pagamento</h2>
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                    Nome da Plataforma
                </label>
                <input
                    id="name"
                    name="name"
                    value={name}
                    // Tipagem explícita para o evento de input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Ex: M-Pesa, Carteira, Conta Bancária"
                    required
                    className={inputClasses}
                />
            </div>

            <div>
                <label htmlFor="initialBalance" className="block text-sm font-medium text-slate-300 mb-1">
                    Saldo Inicial
                </label>
                <div className="relative">
                    <input
                        id="initialBalance"
                        name="initialBalance"
                        type="number"
                        step="0.01"
                        // Usar '' para permitir que o placeholder seja visível quando o valor é 0.
                        value={balance === 0 ? '' : balance} 
                        // Tipagem explícita para o evento de input
                        // Garante que o estado é sempre um número (ou 0 se o input estiver vazio)
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBalance(parseFloat(e.target.value) || 0)}
                        placeholder="0.00 MT"
                        required
                        className={`${inputClasses} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">MT</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Este é o saldo inicial para fins de reconciliação.</p>
            </div>

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
                    className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white`}
                >
                    Guardar
                </button>
            </div>
        </form>
    );
};

export default PaymentMethodForm;