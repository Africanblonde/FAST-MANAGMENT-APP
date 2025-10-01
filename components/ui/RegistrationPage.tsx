import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { CURRENCIES, type CurrencyCode } from '../../contexts/CurrencyContext';
import { type Language } from '../../contexts/LanguageContext';

interface RegistrationPageProps {
    onGoToLanding: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onGoToLanding }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        userName: '',
        userLastName: '',
        email: '',
        password: '',
        currency: 'MZN' as CurrencyCode,
        language: 'pt' as Language
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // Sign up the user with Supabase Auth, storing company and user names in metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: `${formData.userName} ${formData.userLastName}`.trim(),
                        companyName: formData.companyName.trim(),
                        currency: formData.currency,
                        language: formData.language
                    },
                     emailRedirectTo: window.location.origin // Important for confirmation link
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("O registo falhou. Por favor, tente novamente.");
            
            setMessage("Registo quase concluído! Enviámos um email de confirmação para a sua caixa de entrada. Por favor, clique no link para ativar a sua conta.");
        
        } catch (err: any) {
             if (err.message.includes("User already registered")) {
                setError("Este email já está registado. Tente iniciar sessão ou redefinir a sua password.");
            } else {
                setError(err.message || "Ocorreu um erro ao registar.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
            <div className="card" style={{padding: '2rem', width: '100%', maxWidth: '42rem'}}>
                <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Registar Nova Oficina</h2>
                 {error && <p style={{backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center'}}>{error}</p>}
                 {message && <p style={{backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center'}}>{message}</p>}
                
                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <h3 style={{color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem'}}>Dados da Oficina</h3>
                            <div>
                                <label htmlFor="companyName" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Nome da Oficina</label>
                                <input id="companyName" name="companyName" placeholder="Nome da sua oficina" onChange={handleChange} required className="form-input" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 style={{color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem'}}>Dados do Utilizador Administrador</h3>
                            <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                                <div>
                                    <label htmlFor="userName" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Primeiro Nome</label>
                                    <input id="userName" name="userName" placeholder="Seu primeiro nome" onChange={handleChange} required className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="userLastName" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Apelido</label>
                                    <input id="userLastName" name="userLastName" placeholder="Seu apelido" onChange={handleChange} required className="form-input" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Email de Acesso</label>
                                <input id="email" name="email" type="email" placeholder="seu-email@exemplo.com" onChange={handleChange} required className="form-input" />
                            </div>
                            <div>
                                <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Password</label>
                                <input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" onChange={handleChange} required className="form-input" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 style={{color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem'}}>Preferências</h3>
                            <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                                <div>
                                    <label htmlFor="currency" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Moeda Principal</label>
                                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange} required className="form-select">
                                        {CURRENCIES.map(curr => (
                                            <option key={curr.code} value={curr.code}>
                                                {curr.symbol} {curr.namePortuguese} ({curr.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="language" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Idioma</label>
                                    <select id="language" name="language" value={formData.language} onChange={handleChange} required className="form-select">
                                        <option value="pt">🇵🇹 Português</option>
                                        <option value="en">🇬🇧 English</option>
                                        <option value="es">🇪🇸 Español</option>
                                        <option value="ar">🇸🇦 العربية</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%', fontSize: '1.125rem'}}>
                            {loading ? 'A registar...' : 'Criar Conta e Iniciar'}
                        </button>
                    </form>
                )}
                 <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem'}}>
                    <button onClick={onGoToLanding} style={{color: 'var(--color-text-secondary)'}}>Voltar à Página Inicial</button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;