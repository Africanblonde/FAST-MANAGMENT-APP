import React, { useState } from 'react';
import type { Client, Vehicle } from '../../types';

interface VehicleFormProps {
    item: Partial<Vehicle>;
    onSave: (vehicle: Partial<Vehicle>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[]; // Added for duplicate checking
}

const VehicleForm: React.FC<VehicleFormProps> = ({ item, onSave, onCancel, clients, vehicles }) => {
    const [vehicle, setVehicle] = useState({
        clientId: item.clientId || '',
        licensePlate: item.licensePlate || '',
        model: item.model || '',
        type: item.type || 'Ligeiro',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
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
                v => v.licensePlate.trim().toUpperCase() === plate && v.id !== item.id
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
        setVehicle(prev => ({...prev, [name]: name === 'licensePlate' ? value.toUpperCase() : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({ ...item, ...vehicle });
    };

    const ErrorMessage: React.FC<{ name: string }> = ({ name }) => {
        return errors[name] ? <p className="text-sm text-red-400 mt-1">{errors[name]}</p> : null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <select name="clientId" value={vehicle.clientId} onChange={handleChange} required className="form-input">
                    <option value="">Selecione um Cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
                </select>
                <ErrorMessage name="clientId" />
            </div>
            <div>
                <input name="licensePlate" value={vehicle.licensePlate} onChange={handleChange} placeholder="Matrícula" required className="form-input"/>
                <ErrorMessage name="licensePlate" />
            </div>
            <div>
                <input name="model" value={vehicle.model} onChange={handleChange} placeholder="Modelo do Veículo" required className="form-input"/>
                <ErrorMessage name="model" />
            </div>
             <select name="type" value={vehicle.type} onChange={handleChange} required className="form-input">
                <option value="Ligeiro">Ligeiro</option>
                <option value="Pesado">Pesado</option>
            </select>
            <div className="flex justify-end gap-4 pt-4" style={{borderTop: '1px solid var(--color-border)'}}>
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </form>
    );
};

export default VehicleForm;
