import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

// --- MOCK E TIPOS NECESSÁRIOS (Para tornar o ficheiro auto-suficiente) ---

interface ServicePart {
    name: string;
}

// Tipos em falta
interface DiagnosisResponse {
    possiveisCausas: string[];
    verificacoesRecomendadas: string[];
    servicosSugeridos: { nome: string; tipo: 'peça' | 'serviço' }[];
}

/**
 * MOCK: Simula a chamada à API do Gemini para obter um diagnóstico.
 */
const getAIDiagnosis = async (problem: string, services: ServicePart[], parts: ServicePart[]): Promise<DiagnosisResponse> => {
    // Simular um atraso da API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulação de resposta estruturada baseada na descrição
    if (problem.toLowerCase().includes('barulho') && problem.toLowerCase().includes('vibra')) {
        return {
            possiveisCausas: [
                "Junta homocinética gasta (barulho ao virar).",
                "Desalinhamento da direção ou suspensão (vibração em alta velocidade).",
                "Pneu danificado ou mal balanceado.",
                "Rolamento da roda defeituoso."
            ],
            verificacoesRecomendadas: [
                "Inspeção visual detalhada da junta homocinética.",
                "Verificação e ajuste da pressão e balanceamento dos pneus.",
                "Teste de alinhamento da suspensão e cambagem.",
                "Verificar folga e estado do rolamento da roda."
            ],
            servicosSugeridos: [
                { nome: "Substituição da Junta Homocinética", tipo: 'serviço' },
                { nome: "Alinhamento de Direção", tipo: 'serviço' },
                { nome: "Rolamento da Roda", tipo: 'peça' },
                { nome: "Balanceamento de Pneus", tipo: 'serviço' }
            ]
        };
    }

    // Simulação de erro ou resposta genérica
    if (problem.trim() === '') {
         throw new Error("A descrição do problema está vazia.");
    }
    
    return {
        possiveisCausas: ["Requer análise mais aprofundada.", "Falha intermitente no sistema elétrico.", "Sensor de oxigénio com leitura incorreta."],
        verificacoesRecomendadas: ["Leitura de códigos OBD-II.", "Teste de bateria e alternador.", "Verificação da ignição."],
        servicosSugeridos: [{ nome: "Diagnóstico Computorizado", tipo: 'serviço' }, { nome: "Velas de Ignição", tipo: 'peça' }]
    };
};

// --- COMPONENTE PRINCIPAL ---

interface AIDiagnosticsPageProps {
    services: ServicePart[];
    parts: ServicePart[];
}

// CORREÇÃO TS7031: Tipagem explícita adicionada ao parâmetro desestruturado
const AIDiagnosticsPage: React.FC<AIDiagnosticsPageProps> = ({ services, parts }: AIDiagnosticsPageProps) => {
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
            // Os dados de services e parts seriam usados para contextualizar a IA
            const result = await getAIDiagnosis(problem, services, parts);
            setDiagnosis(result);
        } catch (err)
        {
            // Tratamento de erro tipado
            const errorMessage = (err as Error).message || "Ocorreu um erro desconhecido ao comunicar com a IA.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Estilos Tailwind para o tema escuro
    const baseColor = 'text-gray-200';
    const primaryColor = 'text-indigo-400';
    const secondaryColor = 'text-sky-400';

    return (
        <div className="p-4 sm:p-8 bg-slate-900 min-h-screen text-white font-inter">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Cabeçalho */}
                <div className="pb-4 border-b border-slate-700">
                    <h1 className="text-3xl font-bold text-indigo-400">Diagnóstico com Assistente IA</h1>
                    <p className={`mt-1 text-sm ${baseColor}`}>Descreva os sintomas do veículo e a IA irá sugerir possíveis causas e reparações.</p>
                </div>

                {/* Área de Input e Ação */}
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                    <textarea
                        value={problem}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setProblem(e.target.value)}
                        placeholder="Ex: O carro faz um barulho estranho ao virar à direita e o volante vibra em alta velocidade..."
                        className="w-full p-4 bg-slate-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-slate-700 transition resize-none"
                        style={{ minHeight: '8rem' }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleDiagnose}
                        disabled={isLoading}
                        className="w-full mt-4 py-3 text-lg font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200 shadow-md shadow-indigo-900/50 disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Analisando..." : "Obter Diagnóstico"}
                    </button>
                    {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
                    <p className="mt-4 text-xs text-gray-500 text-center">
                        Tente digitar "O carro faz um barulho estranho ao virar e vibra em alta velocidade" para uma demonstração.
                    </p>
                </div>

                {/* Área de Resultados do Diagnóstico */}
                {isLoading && (
                     <div className="text-center p-8 bg-slate-800 rounded-xl">
                        <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-indigo-400">A processar o diagnóstico com IA...</p>
                    </div>
                )}

                {diagnosis && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 transition-opacity duration-500">
                        <h2 className={`text-2xl font-semibold mb-4 ${primaryColor}`}>Resultado do Diagnóstico</h2>
                        <div className="space-y-6">
                            
                            {/* Possíveis Causas */}
                            <div>
                                <h3 className={`text-xl font-medium ${secondaryColor} mb-2`}>Possíveis Causas</h3>
                                <ul className={`list-disc list-inside space-y-1 pl-4 ${baseColor}`}>
                                    {diagnosis.possiveisCausas.map((cause: string, index: number) => <li key={index} className="text-sm">{cause}</li>)}
                                </ul>
                            </div>
                            
                            {/* Verificações Recomendadas */}
                            <div>
                                <h3 className={`text-xl font-medium ${secondaryColor} mb-2`}>Verificações Recomendadas</h3>
                                <ul className={`list-decimal list-inside space-y-1 pl-4 ${baseColor}`}>
                                    {diagnosis.verificacoesRecomendadas.map((step: string, index: number) => <li key={index} className="text-sm">{step}</li>)}
                                </ul>
                            </div>
                            
                            {/* Serviços e Peças Sugeridos */}
                            <div>
                                <h3 className={`text-xl font-medium ${secondaryColor} mb-2`}>Serviços e Peças Sugeridos</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {diagnosis.servicosSugeridos.map((item: { nome: string; tipo: 'peça' | 'serviço' }, index: number) => (
                                        <span key={index} className={`
                                            px-3 py-1 text-sm font-medium rounded-full
                                            ${item.tipo === 'serviço' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'}
                                        `}>
                                            {item.nome} <span className="opacity-70">( {item.tipo} )</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- COMPONENTE WRAPPER APP (Default Export) ---
// Simula a injeção de dados para o componente de diagnóstico.
const App: React.FC = () => {
    // Mock Data para serviços e peças existentes no sistema
    const mockServices: ServicePart[] = [
        { name: "Alinhamento de Direção" }, 
        { name: "Substituição de Óleo" }, 
        { name: "Revisão" }
    ];
    const mockParts: ServicePart[] = [
        { name: "Pneu Novo" }, 
        { name: "Filtro de Ar" }, 
        { name: "Velas de Ignição" }
    ];

    return (
        <AIDiagnosticsPage services={mockServices} parts={mockParts} />
    );
};

export default App;