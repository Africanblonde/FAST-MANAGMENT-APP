import React, { useState } from 'react';

// --- Definições de Tipos Mínimas (Para substituir '../../types' e evitar erros 'any') ---
type Supplier = {
    id: string;
    name: string;
};

type Part = {
    id: string;
    name: string;
    brand: string;
    partNumber: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    supplierId?: string;
    notes?: string;
};

interface PartFormProps {
    item: Partial<Part>;
    onSave: (part: Part) => void;
    onCancel: () => void;
    suppliers: Supplier[];
}

// CORREÇÃO: Tipagem direta das props e valor padrão para 'item' para resolver o erro 7031.
const PartForm = ({ item = {} as Partial<Part>, onSave, onCancel, suppliers }: PartFormProps) => {
    const [part, setPart] = useState<Partial<Part>>(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['quantity', 'purchasePrice', 'salePrice'].includes(name);
        
        // CORREÇÃO: 'prev' tipado como Partial<Part> para resolver o erro 7006.
        setPart((prev: Partial<Part>) => ({...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(part as Part);
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm";
    const selectClasses = inputClasses.replace('shadow-sm', 'shadow-sm appearance-none');
    const textareaClasses = inputClasses.replace('shadow-sm', 'shadow-sm resize-none');

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <input name="name" value={part.name || ''} onChange={handleChange} placeholder="Nome da Peça/Óleo" required className={inputClasses}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="brand" value={part.brand || ''} onChange={handleChange} placeholder="Marca" className={inputClasses}/>
                <input name="partNumber" value={part.partNumber || ''} onChange={handleChange} placeholder="Part Number / Referência" className={inputClasses}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="quantity" type="number" value={part.quantity ?? ''} onChange={handleChange} placeholder="Stock" required className={inputClasses}/>
                <input name="purchasePrice" type="number" step="0.01" value={part.purchasePrice ?? ''} onChange={handleChange} placeholder="Preço de Compra" required className={inputClasses}/>
                <input name="salePrice" type="number" step="0.01" value={part.salePrice ?? ''} onChange={handleChange} placeholder="Preço de Venda" required className={inputClasses}/>
            </div>
            <select name="supplierId" value={part.supplierId || ''} onChange={handleChange} className={selectClasses}>
                <option value="">-- Fornecedor (Opcional) --</option>
                {/* CORREÇÃO: 's' tipado como Supplier para resolver o erro 7006. */}
                {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea name="notes" value={part.notes || ''} onChange={handleChange} placeholder="Notas Adicionais" rows={3} className={textareaClasses}/>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-150">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-md">Guardar</button>
            </div>
        </form>
    );
};

export default PartForm;