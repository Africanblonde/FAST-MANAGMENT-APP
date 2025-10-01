import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface LoginPageProps {
    onGoToLanding: () => void;
    onGoToRegistration: () => void;
    onGoToPasswordReset: () => void;
}

// Removido React.FC e tipado diretamente
const LoginPage = ({ onGoToLanding, onGoToRegistration, onGoToPasswordReset }: LoginPageProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // The onAuthStateChange listener in App.tsx will handle the view change
        } catch(err: any) {
            setError(err.message || "Ocorreu um erro ao iniciar sessão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="card" style={{padding: '2rem', width: '100%', maxWidth: '28rem'}}>
                <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Iniciar Sessão</h2>
                {error && (
                    <p style={{
                        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
                        color: 'var(--color-danger)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </p>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            outline: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#1e1e1e',
                            color: '#fff'
                        }}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            outline: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#1e1e1e',
                            color: '#fff'
                        }}
                    />
                    <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                        <button type="button" onClick={onGoToPasswordReset} style={{color: 'var(--color-primary)', border: 'none', background: 'none'}}>
                            Esqueceu-se da password?
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn btn-primary" 
                        style={{width: '100%', border: 'none'}}
                    >
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
                <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem'}}>
                    <button onClick={onGoToRegistration} style={{color: 'var(--color-primary)', border: 'none', background: 'none'}}>
                        Não tem conta? Registar
                    </button>
                    <span style={{color: 'var(--color-text-tertiary)', margin: '0 0.5rem'}}>|</span>
                    <button onClick={onGoToLanding} style={{color: 'var(--color-text-secondary)', border: 'none', background: 'none'}}>
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;