import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface UpdatePasswordPageProps {
    onSuccess: () => void;
}

const UpdatePasswordPage: React.FC<UpdatePasswordPageProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As passwords não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMessage('A sua password foi atualizada com sucesso! A redirecionar para o login...');
            setTimeout(onSuccess, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Criar Nova Password</h2>
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
                {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-center">{message}</p>}
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <input
                        type="password"
                        placeholder="Nova Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-700 rounded focus:ring-2 focus:ring-red-500 transition"
                    />
                     <input
                        type="password"
                        placeholder="Confirmar Nova Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-700 rounded focus:ring-2 focus:ring-red-500 transition"
                    />
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:bg-red-800 disabled:cursor-not-allowed">
                        {loading ? 'A atualizar...' : 'Atualizar Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;