import React, { useState } from 'react';
import type { Company } from '../types';
import { supabase } from '../services/supabaseClient';

interface ExpiredPageProps {
    company: Company | null;
    onActivationSuccess: () => void;
}

const ExpiredPage: React.FC<ExpiredPageProps> = ({ company, onActivationSuccess }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleActivateLicense = async () => {
        if (!licenseKey.trim() || !company) {
            setMessage({ type: 'error', text: 'Por favor, insira uma chave de licença válida.' });
            return;
        }
        setMessage({ type: 'loading', text: 'A validar...' });
        
        // 1. Find the license
        const { data: license, error: licenseError } = await supabase
            .from('licenses')
            .select('*')
            .eq('key', licenseKey.trim())
            .eq('is_active', true)
            .single();

        if (licenseError || !license) {
            setMessage({ type: 'error', text: 'Chave de licença inválida ou já utilizada.' });
            return;
        }

        // 2. Check if this company already used this license
        const { data: existingActivation } = await supabase
            .from('company_licenses')
            .select('id')
            .eq('company_id', company.id)
            .eq('license_id', license.id)
            .single();
        
        if (existingActivation) {
            setMessage({ type: 'error', text: 'Esta chave de licença já foi ativada por sua empresa.' });
            return;
        }

        // 3. Activate the license for the company
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + license.duration_days);

        const { error: insertError } = await supabase.from('company_licenses').insert({
            company_id: company.id,
            license_id: license.id,
            expires_at: expires_at.toISOString()
        });
        
        if (insertError) {
             setMessage({ type: 'error', text: `Erro ao ativar: ${insertError.message}` });
             return;
        }

        // 4. Deactivate the key so it cannot be reused
        await supabase.from('licenses').update({ is_active: false }).eq('id', license.id);

        const successText = `Licença "${license.description || 'Padrão'}" ativada com sucesso! O seu acesso foi extendido por ${license.duration_days} dias.`;
        setMessage({ type: 'success', text: successText });
        setTimeout(onActivationSuccess, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl text-center border border-red-700/50">
                <h2 className="text-3xl font-bold text-red-400 mb-4">Acesso Expirado</h2>
                <p className="text-slate-300 mb-6">
                    A sua subscrição ou período de teste expirou. Para continuar a usar o Fast Managment, por favor, renove a sua licença.
                </p>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Ativar Nova Licença</h3>
                    <div className="flex items-center gap-4">
                        <input 
                            type="text" 
                            value={licenseKey} 
                            onChange={(e) => setLicenseKey(e.target.value)} 
                            placeholder="Insira a sua nova chave de licença"
                            className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-red-500 transition"
                        />
                        <button 
                            onClick={handleActivateLicense}
                            disabled={message.type === 'loading'}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition disabled:bg-green-800 disabled:cursor-not-allowed"
                        >
                            Ativar
                        </button>
                    </div>
                     {message.text && (
                        <p className={`mt-4 text-sm ${
                            message.type === 'error' ? 'text-red-400' :
                            message.type === 'success' ? 'text-green-400' : 'text-slate-400'
                        }`}>
                            {message.text}
                        </p>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Informações de Pagamento</h3>
                    <div className="text-lg space-y-1 text-slate-300">
                        <p><strong>M-Pesa:</strong> 849069325</p>
                        <p><strong>E-Mola:</strong> 879069325</p>
                        <p className="text-slate-400 mt-1">Nome: <strong>David Zacarias Mulanga Júnior</strong></p>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">Após o pagamento, receberá a sua chave de licença via SMS ou Email.</p>
                </div>
            </div>
        </div>
    );
};

export default ExpiredPage;