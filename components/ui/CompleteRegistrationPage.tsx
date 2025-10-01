import React, { useState, useEffect, useRef } from 'react';
import { supabase, type Session } from '../../services/supabaseClient';
import { initialLayoutSettings, initialPaymentMethods } from '../../utils/helpers';

interface CompleteRegistrationPageProps {
    session: Session;
    onSuccess: () => void;
}

const CompleteRegistrationPage: React.FC<CompleteRegistrationPageProps> = ({ session, onSuccess }) => {
    const [status, setStatus] = useState('A finalizar a configuração da sua conta...');
    const [error, setError] = useState<string | React.ReactNode>('');
    const setupStarted = useRef(false);

    useEffect(() => {
        // This ref prevents the setup function from running twice in React's StrictMode.
        if (setupStarted.current) {
            return;
        }
        setupStarted.current = true;

        const completeSetup = async () => {
            const user = session.user;
            const companyName = user.user_metadata.companyName;
            const userName = user.user_metadata.name;

            if (!companyName || !userName) {
                setError("Não foi possível encontrar os dados para finalizar o registo. Por favor, contacte o suporte.");
                return;
            }

            try {
                // 1. Call the RPC function to handle company, role, and profile creation in a single, secure transaction.
                setStatus('A criar a sua empresa e perfil...');
                const { data: newCompanyId, error: setupError } = await supabase.rpc(
                    'handle_new_user_setup',
                    {
                        c_name: companyName,
                        u_name: userName,
                    }
                );

                if (setupError) throw setupError;
                if (!newCompanyId) throw new Error("A configuração da conta falhou: não foi possível obter o ID da empresa.");


                // 2. Create default settings for the new company.
                setStatus('A aplicar configurações iniciais...');
                const { error: settingsError } = await supabase
                    .from('settings')
                    .insert({
                        company_id: newCompanyId,
                        layout_settings: { ...initialLayoutSettings, companyName: companyName },
                        payment_methods: initialPaymentMethods,
                        logo_url: null
                    });
                if (settingsError) throw settingsError;

                setStatus('Tudo pronto! A redirecionar para a aplicação...');
                setTimeout(onSuccess, 1500);

            } catch (err: any) {
                const errorMessage = err.message ? err.message : JSON.stringify(err, Object.getOwnPropertyNames(err));
                setError(`Ocorreu um erro: ${errorMessage}. Se o problema persistir, contacte o suporte.`);
                console.error("Setup error:", err);
            }
        };

        completeSetup();
    }, [session, onSuccess]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl text-center border border-slate-700">
                <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo!</h2>
                {error ? (
                     typeof error === 'string'
                        ? <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-left">{error}</p>
                        : error
                ) : (
                    <>
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-500 mx-auto my-6"></div>
                        <p className="text-slate-300 text-lg">{status}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompleteRegistrationPage;