import React, { useState } from 'react';
import type { Client, Vehicle } from '../../types';

interface VehicleFormProps {
    item: Partial<Vehicle>;
    onSave: (vehicle: Partial<Vehicle>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[];
}

interface VehicleFormState {
    clientId: string;
    licensePlate: string;
    model: string;
    type: string;
}

interface ErrorMessageProps {
    name: string;
    errors: Record<string, string>;
}

// Componente auxiliar para mensagens de erro - CORRIGIDO
const ErrorMessage = (props: ErrorMessageProps) => {
    const { name, errors } = props;
    return errors[name] ? <p className="text-sm text-red-400 mt-1">{errors[name]}</p> : null;
};

// Use função regular com props tipadas explicitamente
const VehicleForm = (props: VehicleFormProps) => {
    const { item, onSave, onCancel, clients, vehicles } = props;
    
    const [vehicle, setVehicle] = useState<VehicleFormState>({
        clientId: item.clientId || '',
        licensePlate: item.licensePlate || '',
        model: item.model || '',
        type: item.type || 'Ligeiro',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const plate = vehicle.licensePlate.trim().toUpperCase();

        if (!vehicle.clientId) newErrors.clientId = "É obrigatório selecionar um cliente.";
        if (!vehicle.model.trim()) newErrors.model = "O modelo é obrigatório.";
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setVehicle((prev: VehicleFormState) => ({
            ...prev, 
            [name]: name === 'licensePlate' ? value.toUpperCase() : value 
        }));
        if (errors[name]) {
            setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({ ...item, ...vehicle });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <select 
                    name="clientId" 
                    value={vehicle.clientId} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                >
                    <option value="">Selecione um Cliente</option>
                    {clients.map((c: Client) => (
                        <option key={c.id} value={c.id}>
                            {`${c.firstName} ${c.lastName}`.trim()}
                        </option>
                    ))}
                </select>
                <ErrorMessage name="clientId" errors={errors} />
            </div>
            <div>
                <input 
                    name="licensePlate" 
                    value={vehicle.licensePlate} 
                    onChange={handleChange} 
                    placeholder="Matrícula" 
                    required 
                    className="form-input"
                />
                <ErrorMessage name="licensePlate" errors={errors} />
            </div>
            <div>
                <input 
                    name="model" 
                    value={vehicle.model} 
                    onChange={handleChange} 
                    placeholder="Modelo do Veículo" 
                    required 
                    className="form-input"
                />
                <ErrorMessage name="model" errors={errors} />
            </div>
            <div>
                <select 
                    name="type" 
                    value={vehicle.type} 
                    onChange={handleChange} 
                    required 
                    className="form-input"
                >
                    <option value="Ligeiro">Ligeiro</option>
                    <option value="Pesado">Pesado</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default VehicleForm;
