import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'xl' | '3xl' | '5xl';
}

// Removido React.FC e tipado diretamente
const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    if (!isOpen) return null;

    // A simple mapping to apply inline styles for max-width, as Tailwind classes might not be available.
    const sizeStyles: React.CSSProperties = {
        maxWidth: { md: '28rem', xl: '36rem', '3xl': '48rem', '5xl': '64rem' }[size]
    };

    return (
        <div 
            className="modal-wrapper"
            onClick={onClose}
        >
            <div 
                className="modal-content"
                style={sizeStyles}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <div className="modal-header no-print">
                    <h2>{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="btn-icon"
                        aria-label="Fechar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;