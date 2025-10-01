import React from 'react';
import type { Permission } from '../types';

interface GenericManagementPageProps<T extends { id: string }> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onItemClick?: (id: string) => void;
  hasPermission: (p: Permission) => boolean;
  permissionPrefix: string;
  customHeaderButtons?: React.ReactNode;
  renderExtraActions?: (item: T) => React.ReactNode;
}

const GenericManagementPage = <T extends { id: string; }>({ 
    title, 
    items, 
    renderItem, 
    onAdd, 
    onEdit, 
    onDelete, 
    onItemClick, 
    hasPermission, 
    permissionPrefix, 
    customHeaderButtons, 
    renderExtraActions 
}: GenericManagementPageProps<T>) => {
    const canCreate = hasPermission(`create_${permissionPrefix}` as Permission) || hasPermission(`manage_${permissionPrefix}` as Permission);
    const canEdit = hasPermission(`edit_${permissionPrefix}` as Permission) || hasPermission(`manage_${permissionPrefix}` as Permission);
    const canDelete = hasPermission(`delete_${permissionPrefix}` as Permission) || hasPermission(`manage_${permissionPrefix}` as Permission);
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1>{title}</h1>
                 <div className="flex gap-2 flex-wrap">
                    {customHeaderButtons}
                    {onAdd && canCreate && (
                         <button onClick={onAdd} className="btn btn-primary flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Adicionar
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length > 0 ? items.map(item => (
                    <div key={item.id} className="card" style={{display: 'flex', flexDirection: 'column'}}>
                        <div 
                            style={{padding: '1.25rem', flexGrow: 1, cursor: onItemClick ? 'pointer' : 'default'}} 
                            onClick={() => onItemClick?.(item.id)}
                        >
                             {renderItem(item)}
                        </div>
                        {(canEdit || canDelete || renderExtraActions) && (
                            <div className="flex justify-end items-center gap-2" style={{padding: '0.5rem', borderTop: '1px solid var(--color-border-subtle)'}}>
                                {renderExtraActions && renderExtraActions(item)}
                                {onEdit && canEdit && <button onClick={() => onEdit(item.id)} className="btn-icon" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>}
                                {onDelete && canDelete && <button onClick={() => onDelete(item.id)} className="btn-icon" style={{color: 'var(--color-danger)'}} title="Apagar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>}
                            </div>
                        )}
                    </div>
                )) : <p style={{color: 'var(--color-text-secondary)', gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 0'}}>Nenhum item encontrado.</p>}
            </div>
        </div>
    );
}

export default GenericManagementPage;