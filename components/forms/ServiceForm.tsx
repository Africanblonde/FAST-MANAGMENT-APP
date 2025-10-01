import React, { useState, useEffect } from 'react';

// --- Tipos Locais (Substituindo '../../types') ---
type Service = {
    id?: string;
    name: string;
    price: number;
    description: string;
};

interface ServiceFormProps {
    item?: Service;
    onSave: (data: Pick<Service, 'name' | 'price' | 'description'>, id?: string) => void;
    onCancel: () => void;
}

// Valores iniciais para o estado do formulário
const initialServiceState: Service = {
    name: '',
    price: 0,
    description: '',
};

const ServiceForm: React.FC<ServiceFormProps> = ({ 
    item, 
    onSave, 
    onCancel 
}: ServiceFormProps) => {
    
    const [serviceData, setServiceData] = useState<Service>(item || initialServiceState);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setServiceData(item);
        } else {
            setServiceData(initialServiceState);
        }
    }, [item]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setError(null);
        const { name, value, type } = e.target;
        
        setServiceData((prev: Service) => {
            let newValue: string | number = value;

            if (type === 'number' || name === 'price') {
                newValue = parseFloat(value) || 0;
            }
            return { ...prev, [name]: newValue };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!serviceData.name.trim() || serviceData.price <= 0 || !serviceData.description.trim()) {
            setError("Por favor, preencha o Nome, Descrição e um Preço válido (> 0).");
            return;
        }

        onSave(
            { 
                name: serviceData.name, 
                price: serviceData.price, 
                description: serviceData.description 
            }, 
            item?.id
        );
    };

    // Classes de estilo
    const inputClasses = "w-full p-3 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out shadow-sm";
    const buttonClasses = "font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow-md";
    const formTitle = item ? 'Editar Serviço' : 'Adicionar Novo Serviço';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-slate-900 rounded-xl text-slate-100 shadow-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-teal-400 border-b border-slate-700 pb-3">{formTitle}</h2>
            
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg animate-pulse">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nome do Serviço</label>
                <input 
                    id="name"
                    name="name" 
                    type="text"
                    value={serviceData.name} 
                    onChange={handleChange} 
                    placeholder="Ex: Mudança de Óleo" 
                    required 
                    className={inputClasses}
                />
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-1">Preço Base</label>
                <div className="relative">
                    <input 
                        id="price"
                        name="price" 
                        type="number" 
                        step="0.01" 
                        value={serviceData.price === 0 ? '' : serviceData.price} 
                        onChange={handleChange} 
                        placeholder="0.00" 
                        required 
                        className={`${inputClasses} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">MT</span>
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                <textarea 
                    id="description"
                    name="description" 
                    rows={3}
                    value={serviceData.description} 
                    onChange={handleChange} 
                    placeholder="Descrição detalhada do serviço oferecido..." 
                    required 
                    className={`${inputClasses} resize-none`}
                />
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
                    className={`${buttonClasses} bg-teal-600 hover:bg-teal-700 text-white`}
                >
                    {item ? 'Guardar Alterações' : 'Guardar Serviço'}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;