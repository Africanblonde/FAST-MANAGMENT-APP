import React, { useState } from 'react';
// import type { Client, Vehicle } from '../../types'; 
// Tipos definidos localmente para auto-suficiência do ficheiro:

type Client = {
    id: string;
    firstName: string;
    lastName: string;
    // Assume-se outros campos necessários para o tipo Client
};

type Vehicle = {
    id: string;
    clientId: string;
    licensePlate: string;
    model: string;
    type: 'Ligeiro' | 'Pesado';
    // Assume-se outros campos necessários para o tipo Vehicle
};

// Tipo para o estado interno do formulário (que é um subconjunto de Vehicle)
type VehicleState = Pick<Vehicle, 'clientId' | 'licensePlate' | 'model' | 'type'>;

interface VehicleFormProps {
    item: Partial<Vehicle>;
    onSave: (vehicle: Partial<Vehicle>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[]; // Usado para verificação de duplicados
}

// Tipo de Erros
type FormErrors = Record<keyof VehicleState | 'general', string>;

// Classes de estilo Tailwind (Dark Mode)
const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out shadow-sm";
const buttonClasses = "font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow-md";
const primaryColor = 'teal'; 

// Remoção do React.FC e tipagem direta do argumento da função para resolver erros 7031
const VehicleForm = ({ item, onSave, onCancel, clients, vehicles }: VehicleFormProps) => {
    
    // O estado é tipado como VehicleState
    const [vehicle, setVehicle] = useState<VehicleState>({
        clientId: item.clientId || '',
        licensePlate: item.licensePlate || '',
        model: item.model || '',
        type: item.type || 'Ligeiro',
    });
    
    // Inicializar com o tipo FormErrors vazio.
    const [errors, setErrors] = useState<FormErrors>({} as FormErrors);

    const validate = (): boolean => {
        // Tipagem explícita para o objeto de erros
        const newErrors: FormErrors = {} as FormErrors;
        const plate = vehicle.licensePlate.trim().toUpperCase();

        if (!vehicle.clientId) newErrors.clientId = "É obrigatório selecionar um cliente.";
        if (!vehicle.model.trim()) newErrors.model = "O modelo é obrigatório.";
        
        // Verificação da Matrícula
        if (!plate) {
            newErrors.licensePlate = "A matrícula é obrigatória.";
        } else if (plate.length < 4) {
            newErrors.licensePlate = "A matrícula parece curta demais.";
        } else {
            const isDuplicate = vehicles.some(
                (v: Vehicle) => v.licensePlate.trim().toUpperCase() === plate && v.id !== item.id
            );
            if (isDuplicate) {
                newErrors.licensePlate = "Esta matrícula já está registada.";
            }
        }
        
        // Tipagem explícita no parâmetro 'prevErrors'
        setErrors((prevErrors: FormErrors) => {
             const updatedErrors = { ...prevErrors, ...newErrors };
             
             // Remove erros antigos que não estão presentes nos novos erros (significa que foram corrigidos)
             (Object.keys(updatedErrors) as (keyof FormErrors)[]).forEach(key => {
                 if (!newErrors[key] && updatedErrors[key] && !vehicle[key as keyof VehicleState]) {
                     delete updatedErrors[key];
                 }
             });
             
             // Apenas retorna os novos erros que realmente existem
             const finalErrors: FormErrors = {} as FormErrors;
             (Object.keys(newErrors) as (keyof VehicleState)[]).forEach(key => {
                if(newErrors[key]) finalErrors[key] = newErrors[key];
             });
             
             return finalErrors;
        });

        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // setVehicle tipado corretamente (prev: VehicleState)
        setVehicle((prev: VehicleState) => ({
            ...prev, 
            [name]: name === 'licensePlate' ? value.toUpperCase() : value 
        }));
        
        // Tipagem explícita para apagar o erro
        if (errors[name as keyof FormErrors]) {
            setErrors((prev: FormErrors) => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        // Garantir que a matrícula final é em maiúsculas
        const finalVehicle = { 
            ...item, 
            ...vehicle, 
            licensePlate: vehicle.licensePlate.trim().toUpperCase() 
        };
        onSave(finalVehicle);
    };

    // CORREÇÃO: Tipagem explícita no objeto desestruturado para remover o erro 7031
    const ErrorMessage: React.FC<{ name: keyof FormErrors }> = ({ name }: { name: keyof FormErrors }) => {
        return errors[name] ? <p className="text-sm text-red-400 mt-1">{errors[name]}</p> : null;
    };

    const formTitle = item.id ? 'Editar Veículo' : 'Adicionar Novo Veículo';

    // Estilo adaptado para Dark Mode com Tailwind
    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-slate-900 rounded-xl text-slate-100 shadow-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-teal-400 border-b border-slate-700 pb-3">{formTitle}</h2>
            
            {/* 1. Selecionar Cliente */}
            <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-1">Cliente</label>
                <select 
                    id="clientId"
                    name="clientId" 
                    value={vehicle.clientId} 
                    onChange={handleChange} 
                    required 
                    className={inputClasses}
                >
                    <option value="">Selecione um Cliente</option>
                    {/* Parâmetro 'c' tipado no mapeamento */}
                    {clients.map((c: Client) => 
                        <option key={c.id} value={c.id}>
                            {`${c.firstName} ${c.lastName}`.trim()}
                        </option>
                    )}
                </select>
                <ErrorMessage name="clientId" />
            </div>

            {/* 2. Matrícula */}
            <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-slate-300 mb-1">Matrícula</label>
                <input 
                    id="licensePlate"
                    name="licensePlate" 
                    value={vehicle.licensePlate} 
                    onChange={handleChange} 
                    placeholder="Matrícula (Ex: ABC-123-CD)" 
                    required 
                    className={inputClasses}
                />
                <ErrorMessage name="licensePlate" />
            </div>

            {/* 3. Modelo */}
            <div>
                <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">Modelo do Veículo</label>
                <input 
                    id="model"
                    name="model" 
                    value={vehicle.model} 
                    onChange={handleChange} 
                    placeholder="Ex: Toyota Corolla, BMW Série 3" 
                    required 
                    className={inputClasses}
                />
                <ErrorMessage name="model" />
            </div>

            {/* 4. Tipo */}
            <div>
                 <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Veículo</label>
                 <select 
                     id="type"
                     name="type" 
                     value={vehicle.type} 
                     onChange={handleChange} 
                     required 
                     className={inputClasses}
                 >
                    <option value="Ligeiro">Ligeiro</option>
                    <option value="Pesado">Pesado</option>
                </select>
                <ErrorMessage name="type" />
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

export default VehicleForm;
