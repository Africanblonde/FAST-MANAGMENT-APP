import React from 'react';
import type { Part, Permission } from '../types';
import GenericManagementPage from '../components/GenericManagementPage';
import { formatCurrency } from '../utils/helpers';

interface PartsPageProps {
    parts: Part[];
    onAdd: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    hasPermission: (p: Permission) => boolean;
}

// Removido React.FC
const PartsPage = ({ parts, onAdd, onEdit, onDelete, hasPermission }: PartsPageProps) => {
    return (
        <GenericManagementPage<Part>
            title="Peças e Óleos"
            items={parts}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            hasPermission={hasPermission}
            permissionPrefix="parts"
            renderItem={(item: Part) => {
                const stockStyle: React.CSSProperties = item.quantity > 5 
                    ? { backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)' } 
                    : item.quantity > 0 
                    ? { backgroundColor: 'hsla(45, 93%, 58%, 0.1)', color: 'var(--color-warning)' } 
                    : { backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--color-danger)' };
                return (
                    <>
                        <div className="flex justify-between items-start">
                            <h3 style={{ fontSize: '1.125rem', paddingRight: '0.5rem' }}>{item.name}</h3>
                            <span style={{ 
                                flexShrink: 0, padding: '0.25rem 0.75rem', fontSize: '0.75rem', 
                                borderRadius: '9999px', fontWeight: 600, ...stockStyle 
                            }}>
                                Stock: {item.quantity}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.brand || 'Marca não especificada'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.partNumber || 'S/ Ref.'}</p>
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                            <p style={{ color: 'var(--color-success)', fontWeight: 600, textAlign: 'right' }}>Venda: {formatCurrency(item.salePrice)}</p>
                        </div>
                    </>
                );
            }}
        />
    );
};

export default PartsPage;