import React, { useState } from 'react';
import type { ReactNode, MouseEvent } from 'react';

// --- DEFINIÇÃO DO COMPONENTE MODAL ---

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    // Define os tamanhos disponíveis usando classes Tailwind (max-width)
    size?: 'md' | 'xl' | '3xl' | '5xl'; 
}

/**
 * Componente Modal genérico e responsivo.
 * @param {ModalProps} props - Propriedades do modal.
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    if (!isOpen) return null;

    // Mapeamento das classes Tailwind para os diferentes tamanhos do modal.
    const sizeClasses = {
        md: 'max-w-md',
        xl: 'max-w-xl',
        '3xl': 'max-w-3xl',
        '5xl': 'max-w-5xl',
    };

    return (
        // Wrapper principal: Fundo escuro semi-transparente que cobre toda a tela (Overlay/Backdrop)
        // Clicar aqui deve fechar o modal.
        <div 
            className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* Conteúdo do Modal: Evita o fechamento ao clicar no interior (e.stopPropagation) */}
            <div 
                className={`bg-white rounded-xl shadow-2xl w-full mx-auto ${sizeClasses[size]} overflow-hidden transform transition-all duration-300 scale-100 opacity-100`}
                onClick={(e: MouseEvent) => e.stopPropagation()} // Fix TS7006: Tipagem explícita do evento
            >
                {/* Header do Modal */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
                        aria-label="Fechar modal"
                    >
                        {/* Ícone SVG de Fechar (X) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                {/* Corpo do Modal */}
                <div className="p-6 text-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE DEMONSTRATIVO (APP) ---

const App: React.FC = () => {
    const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
    const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 space-y-4">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Demonstração de Modal React</h1>

            {/* Botão para abrir o Modal Pequeno */}
            <button 
                onClick={() => setIsSmallModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200"
            >
                Abrir Modal (Tamanho MD)
            </button>
            
            {/* Botão para abrir o Modal Grande */}
            <button 
                onClick={() => setIsLargeModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200"
            >
                Abrir Modal (Tamanho 3XL)
            </button>

            {/* Modal de Tamanho Médio */}
            <Modal 
                isOpen={isSmallModalOpen} 
                onClose={() => setIsSmallModalOpen(false)} 
                title="Detalhes do Produto"
                size="md"
            >
                <p className="mb-4">Este é um modal de tamanho padrão (`md`). É ideal para formulários curtos ou mensagens de confirmação.</p>
                <button 
                    onClick={() => setIsSmallModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                    Fechar
                </button>
            </Modal>

            {/* Modal de Tamanho Grande */}
            <Modal 
                isOpen={isLargeModalOpen} 
                onClose={() => setIsLargeModalOpen(false)} 
                title="Relatório Detalhado de Vendas"
                size="3xl"
            >
                <p className="mb-4">Este é um modal maior (`3xl`), perfeito para exibir tabelas complexas ou relatórios que exigem mais espaço horizontal.</p>
                <div className="h-40 bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center rounded-lg text-gray-500">
                    Espaço para Gráficos ou Tabelas
                </div>
            </Modal>
        </div>
    );
}

export default App;