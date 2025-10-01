import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface PasswordResetRequestPageProps {
    onGoToLogin: () => void;
}

const PasswordResetRequestPage: React.FC<PasswordResetRequestPageProps> = ({ onGoToLogin }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Redirect to the app's base URL
        });

        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMessage('Se o email existir na nossa base de dados, receberá um link para redefinir a sua password.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Redefinir Password</h2>
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
                {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-center">{message}</p>}
                
                <form onSubmit={handleResetRequest} className="space-y-6">
                    <p className="text-slate-400 text-sm">Insira o seu email e enviaremos um link para criar uma nova password.</p>
                    <input
                        type="email"
                        placeholder="Seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-700 rounded focus:ring-2 focus:ring-red-500 transition"
                    />
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:bg-red-800 disabled:cursor-not-allowed">
                        {loading ? 'A enviar...' : 'Enviar Link de Redefinição'}
                    </button>
                </form>
                 <div className="mt-6 text-center text-sm">
                    <button onClick={onGoToLogin} className="text-slate-400 hover:text-slate-300">Voltar ao Login</button>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetRequestPage;