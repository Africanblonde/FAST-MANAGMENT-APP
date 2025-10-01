import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

// --- SIMULAÇÃO DO CLIENTE SUPABASE (MOCK) ---
// Em um ambiente real, 'supabase' seria importado de '../../services/supabaseClient'.
// Aqui, simulamos o comportamento para tornar o código executável.
const mockSupabase = {
    auth: {
        /**
         * Simula a atualização do usuário.
         * Sucesso se a password não for 'fail_update'.
         */
        updateUser: async ({ password }: { password: string }) => {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simula latência de rede
            
            if (password.toLowerCase().includes('fail_update')) {
                // Simula um erro de token expirado ou falha de rede
                return { error: { message: 'Sessão expirada. Por favor, re-autentique-se.' } };
            }
            
            // Simula sucesso
            return { error: null };
        },
    },
};

// Usamos a simulação no lugar da importação real
const supabase = mockSupabase;


// --- COMPONENTE PRINCIPAL ---

interface UpdatePasswordPageProps {
    // A função onSuccess é chamada após a atualização bem-sucedida,
    // tipagem explícita para evitar TS7031
    onSuccess: () => void; 
}

const UpdatePasswordPage: React.FC<UpdatePasswordPageProps> = ({ onSuccess }: UpdatePasswordPageProps) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Tipagem correta para o evento de formulário
    const handlePasswordUpdate = async (e: FormEvent) => {
        e.preventDefault();
        
        // Limpeza de erros e mensagens
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('As passwords não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        // Chamada simulada do Supabase
        const { error: supabaseError } = await supabase.auth.updateUser({ password });

        setLoading(false);
        if (supabaseError) {
            setError(supabaseError.message);
        } else {
            setMessage('A sua password foi atualizada com sucesso! A redirecionar...');
            // Simula o redirecionamento ou ação de sucesso
            setTimeout(onSuccess, 3000); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-red-500">
                <h2 className="text-3xl font-extrabold text-white text-center mb-8">
                    Criar Nova Password
                </h2>
                
                {/* Exibição de Erro */}
                {error && (
                    <p className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-medium border border-red-700">
                        {error}
                    </p>
                )}
                
                {/* Exibição de Sucesso */}
                {message && (
                    <p className="bg-green-900/50 text-green-300 p-3 rounded-lg mb-6 text-center text-sm font-medium border border-green-700">
                        {message}
                    </p>
                )}
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    {/* Input Nova Password */}
                    <input
                        type="password"
                        placeholder="Nova Password"
                        value={password}
                        // FIX TS7006: Tipagem explícita para o evento onChange
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full p-3 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent border border-slate-700 transition"
                        disabled={loading}
                    />
                    
                    {/* Input Confirmar Password */}
                    <input
                        type="password"
                        placeholder="Confirmar Nova Password"
                        value={confirmPassword}
                        // FIX TS7006: Tipagem explícita para o evento onChange
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full p-3 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent border border-slate-700 transition"
                        disabled={loading}
                    />
                    
                    {/* Botão de Submissão */}
                    <button 
                        type="submit" 
                        disabled={loading || message !== ''} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-red-900/50 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                A atualizar...
                            </>
                        ) : 'Atualizar Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE WRAPPER PARA DEMONSTRAÇÃO ---
const App: React.FC = () => {
    const [status, setStatus] = useState<'initial' | 'success'>('initial');

    const handleSuccess = () => {
        console.log("Password updated successfully. Redirecting...");
        setStatus('success');
    };

    return (
        <div className="bg-slate-900 min-h-screen">
            {status === 'initial' ? (
                <UpdatePasswordPage onSuccess={handleSuccess} />
            ) : (
                <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
                    <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <h1 className="text-4xl font-extrabold text-white mb-3">Password Redefinida!</h1>
                    <p className="text-slate-400 text-lg">Pode agora usar a sua nova password para iniciar sessão (simulado).</p>
                    <button 
                        onClick={() => setStatus('initial')} 
                        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                    >
                        Tentar Novamente
                    </button>
                    <p className="mt-4 text-xs text-slate-500">
                        * Use 'fail_update' como password para simular um erro do Supabase.
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;
