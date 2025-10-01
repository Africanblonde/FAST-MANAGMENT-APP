import React, { useState } from 'react';
import type { Purchase, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface PurchasePaymentFormProps {
    purchase: Purchase;
    supplierName: string;
    onSave: (purchaseId: string, paymentMethod: string, amount: number) => void;
    onCancel: () => void;
    paymentMethods: PaymentMethod[];
    balance: number;
}

const PurchasePaymentForm: React.FC<PurchasePaymentFormProps> = ({ purchase, supplierName, onSave, onCancel, paymentMethods, balance }) => {
    const [amount, setAmount] = useState(balance);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(amount <= 0 || amount > balance + 0.01) {
            alert(`O valor a pagar deve ser maior que zero e não superior à dívida de ${formatCurrency(balance)}.`);
            return;
        }
        onSave(purchase.id, paymentMethod, amount);
    };

    return (
        <div className="space-y-6">
            {/* Header com ícone */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-600">
                <div className="p-3 bg-green-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Registar Pagamento</h3>
                    <p className="text-sm text-gray-400">Liquidar dívida ao fornecedor</p>
                </div>
            </div>

            {/* Informações da Compra */}
            <div className="card">
                <div className="card-body">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Detalhes da Compra
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <span className="text-gray-400">Fornecedor:</span>
                            <span className="font-semibold text-white">{supplierName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <span className="text-gray-400">Item:</span>
                            <span className="font-semibold text-white">{purchase.description}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-800 rounded-lg">
                            <span className="text-red-300 font-medium">Dívida Total:</span>
                            <span className="text-xl font-bold text-red-400">{formatCurrency(balance)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulário de Pagamento */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="card">
                    <div className="card-body">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Dados do Pagamento
                        </h4>
                        
                        <div className="space-y-4">
                            <div className="form-group">
                                <label htmlFor="amount" className="form-label">Valor a Pagar</label>
                                <div className="relative">
                                    <input 
                                        id="amount" 
                                        type="number" 
                                        step="0.01" 
                                        value={amount ?? ''} 
                                        onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
                                        required 
                                        className="form-input pr-12"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-gray-400 text-sm font-medium">MT</span>
                                    </div>
                                </div>
                                {amount > balance && (
                                    <p className="form-error">O valor não pode ser superior à dívida de {formatCurrency(balance)}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentMethodPurchase" className="form-label">Método de Pagamento</label>
                                <select 
                                    id="paymentMethodPurchase" 
                                    value={paymentMethod} 
                                    onChange={e => setPaymentMethod(e.target.value)} 
                                    required 
                                    className="form-select"
                                >
                                    {paymentMethods.map(pm => (
                                        <option key={pm.name} value={pm.name}>{pm.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumo do Pagamento */}
                {amount > 0 && amount <= balance && (
                    <div className="card">
                        <div className="card-body">
                            <h4 className="text-lg font-semibold text-white mb-4">Resumo do Pagamento</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>Valor a pagar:</span>
                                    <span className="font-semibold">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>Dívida restante:</span>
                                    <span className="font-semibold">{formatCurrency(balance - amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-400 text-lg font-bold pt-2 border-t border-gray-600">
                                    <span>Status:</span>
                                    <span>{balance - amount <= 0.01 ? 'Totalmente Pago' : 'Pagamento Parcial'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-600">
                    <button type="button" onClick={onCancel} className="btn btn-ghost">
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar Pagamento
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchasePaymentForm;