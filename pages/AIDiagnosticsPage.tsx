import React, { useState } from 'react';
import type { DiagnosisResponse } from '../types';
import { getAIDiagnosis } from '../services/geminiService';

interface AIDiagnosticsPageProps {
    services: { name: string }[];
    parts: { name: string }[];
}

const AIDiagnosticsPage: React.FC<AIDiagnosticsPageProps> = ({ services, parts }) => {
    const [problem, setProblem] = useState('');
    const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDiagnose = async () => {
        if (!problem.trim()) {
            setError("Por favor, descreva o problema do veículo.");
            return;
        }
        setIsLoading(true);
        setError('');
        setDiagnosis(null);
        try {
            const result = await getAIDiagnosis(problem, services, parts);
            setDiagnosis(result);
        } catch (err: any)
{
            setError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1>Diagnóstico com Assistente IA</h1>
                <p style={{color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>Descreva os sintomas do veículo e a IA irá sugerir possíveis causas e reparações.</p>
            </div>

            <div className="card" style={{padding: '1.5rem'}}>
                <textarea
                    value={problem}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProblem(e.target.value)}
                    placeholder="Ex: O carro faz um barulho estranho ao virar à direita e o volante vibra em alta velocidade..."
                    className="form-textarea"
                    style={{ minHeight: '8rem' }}
                    disabled={isLoading}
                />
                <button
                    onClick={handleDiagnose}
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{width: '100%', marginTop: '1rem'}}
                >
                    {isLoading ? "Analisando..." : "Obter Diagnóstico"}
                </button>
                {error && <p style={{color: 'var(--color-danger)', marginTop: '1rem', textAlign: 'center'}}>{error}</p>}
            </div>

            {diagnosis && (
                <div className="card animate-fade-in" style={{padding: '1.5rem'}}>
                    <h2>Resultado do Diagnóstico</h2>
                    <div className="space-y-6" style={{marginTop: '1.5rem'}}>
                        <div>
                            <h3 style={{color: 'var(--color-primary)'}}>Possíveis Causas</h3>
                            <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)'}}>
                                {diagnosis.possiveisCausas.map((cause: string, index: number) => <li key={index}>{cause}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 style={{color: 'var(--color-primary)'}}>Verificações Recomendadas</h3>
                            <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)'}}>
                                {diagnosis.verificacoesRecomendadas.map((step: string, index: number) => <li key={index}>{step}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 style={{color: 'var(--color-primary)'}}>Serviços e Peças Sugeridos</h3>
                             <div className="flex flex-wrap gap-2" style={{marginTop: '0.5rem'}}>
                                {diagnosis.servicosSugeridos.map((item: { nome: string; tipo: 'peça' | 'serviço' }, index: number) => (
                                    <span key={index} style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500,
                                        backgroundColor: item.tipo === 'serviço' ? 'hsla(217, 91%, 60%, 0.1)' : 'hsla(139, 60%, 55%, 0.1)',
                                        color: item.tipo === 'serviço' ? 'var(--color-secondary)' : 'var(--color-success)'
                                    }}>
                                        {item.nome} <span style={{opacity: 0.7}}>( {item.tipo} )</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDiagnosticsPage;