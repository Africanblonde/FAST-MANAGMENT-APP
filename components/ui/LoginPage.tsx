import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

// --- MOCK SUPABASE CLIENTE E CONTEXTO DE AUTENTICAÇÃO ---

// Define a estrutura do objeto de erro
interface AuthError {
    message: string;
}

// Mock do Supabase client para simular a autenticação
const supabase = {
    auth: {
        /**
         * Simula a tentativa de login.
         * Sucesso se a password for 'password123'.
         */
        signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
            console.log(`Attempting login for: ${email}`);
            
            if (password === 'password123' && email.includes('@')) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("Login successful (Mock)");
                return { error: null };
            }

            // Simula erro de login
            await new Promise(resolve => setTimeout(resolve, 1000));
            const error: AuthError = { message: "Credenciais inválidas. Verifique o email e a palavra-passe." };
            return { error };
        },
    }
};

// --- LOGIN PAGE COMPONENT ---

interface LoginPageProps {
    onGoToLanding: () => void;
    onGoToRegistration: () => void;
    onGoToPasswordReset: () => void;
}

// CORREÇÃO: Tipagem explícita adicionada ao parâmetro desestruturado
const LoginPage = ({ onGoToLanding, onGoToRegistration, onGoToPasswordReset }: LoginPageProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Tipagem correta para o evento de formulário
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // Aqui, numa app real, haveria um redirecionamento.
            console.log("Mock Login Successful: Redirecionando para Dashboard/Home.");
        } catch(err) {
            // Garante que o erro é tratado como um objeto estruturado
            const errorMessage = (err as AuthError)?.message || "Ocorreu um erro desconhecido ao iniciar sessão.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="p-8 w-full max-w-sm sm:max-w-md bg-slate-800 text-gray-100 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                <h2 className="text-center mb-6 text-3xl font-bold">Iniciar Sessão</h2>
                
                {/* Exibição de Erro */}
                {error && (
                    <p className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 text-center border border-red-700 text-sm">
                        {error}
                    </p>
                )}
                
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    
                    {/* Input Email */}
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        // Tipagem explícita para o evento onChange
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent border border-slate-700 transition"
                        disabled={loading}
                    />
                    
                    {/* Input Password */}
                    <input 
                        type="password" 
                        placeholder="Palavra-passe" 
                        value={password}
                        // Tipagem explícita para o evento onChange
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent border border-slate-700 transition"
                        disabled={loading}
                    />
                    
                    <div className="text-right text-sm">
                        <button 
                            type="button" 
                            onClick={onGoToPasswordReset} 
                            className="text-indigo-400 hover:text-indigo-300 transition underline disabled:opacity-50"
                        >
                            Esqueceu-se da palavra-passe?
                        </button>
                    </div>
                    
                    {/* Botão de Submissão */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-3 text-lg font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200 shadow-md shadow-indigo-900/50 disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
                
                <div className="mt-6 pt-4 text-center text-sm border-t border-slate-700 space-x-3">
                    <button onClick={onGoToRegistration} className="text-indigo-400 hover:text-indigo-300 transition">
                        Não tem conta? Registar
                    </button>
                    <span className="text-slate-500">|</span>
                    <button onClick={onGoToLanding} className="text-slate-400 hover:text-white transition">
                        Voltar
                    </button>
                </div>
                <p className="mt-4 text-xs text-slate-500 text-center">
                    Dica: Use 'password123' como palavra-passe para simular um login bem-sucedido.
                </p>
            </div>
        </div>
    );
};


// --- COMPONENTE WRAPPER APP ---
const App: React.FC = () => {
    const [currentView, setCurrentView] = useState('login');
    
    // Funções de navegação mockadas
    const nav = (view: string) => () => {
        console.log(`Navigating to: ${view}`);
        setCurrentView(view);
    };

    const renderView = () => {
        switch (currentView) {
            case 'login':
                return (
                    <LoginPage 
                        onGoToLanding={nav('landing')}
                        onGoToRegistration={nav('registration')}
                        onGoToPasswordReset={nav('password-reset')}
                    />
                );
            case 'registration':
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                        <h1 className="text-xl font-bold mb-4">Página de Registo (Placeholder)</h1>
                        <button onClick={nav('login')} className="text-indigo-400 hover:text-indigo-300 transition underline">Voltar para Login</button>
                    </div>
                );
            case 'password-reset':
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                        <h1 className="text-xl font-bold mb-4">Recuperar Palavra-passe (Placeholder)</h1>
                        <button onClick={nav('login')} className="text-indigo-400 hover:text-indigo-300 transition underline">Voltar para Login</button>
                    </div>
                );
            case 'landing':
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                        <h1 className="text-xl font-bold mb-4">Landing Page (Placeholder)</h1>
                        <button onClick={nav('login')} className="text-indigo-400 hover:text-indigo-300 transition underline">Voltar para Login</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return renderView();
};

export default App;