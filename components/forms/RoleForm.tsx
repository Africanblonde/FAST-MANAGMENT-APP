import React, { useState, useRef } from 'react';
import type { Role, Permission } from '../../types';
import { PERMISSION_GROUPS } from '../../constants';

interface RoleFormProps {
    item: Partial<Role>;
    onSave: (role: Role) => void;
    onCancel: () => void;
}

const AccordionIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const RoleForm: React.FC<RoleFormProps> = ({ item, onSave, onCancel }: RoleFormProps) => {
    const [role, setRole] = useState({
        name: item.name || '',
        permissions: (item.permissions as Permission[]) || []
    });
    const [openGroup, setOpenGroup] = useState<string | null>(Object.keys(PERMISSION_GROUPS)[0]);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        setRole((prev: typeof role) => {
            const permissions = new Set(prev.permissions);
            if(checked) {
                permissions.add(permission);
            } else {
                permissions.delete(permission);
            }
            return { ...prev, permissions: Array.from(permissions) };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!role.name.trim()) {
            alert("O nome do perfil não pode estar vazio.");
            return;
        }
        onSave({ ...item, ...role } as Role);
    };
    
    const handleToggleGroup = (groupKey: string) => {
        setOpenGroup((prev: string | null) => (prev === groupKey ? null : groupKey));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="roleName" className="form-label">Nome do Perfil</label>
                <input id="roleName" name="name" value={role.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole((prev: typeof role) => ({...prev, name: e.target.value}))} placeholder="Ex: Gerente de Vendas" required className="form-input"/>
            </div>
            
            <div className="space-y-2">
                 {Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
                    const groupPermissions = Object.keys(group.permissions) as Permission[];
                    const selectedInGroup = groupPermissions.filter(p => role.permissions.includes(p));
                    const allSelected = selectedInGroup.length === groupPermissions.length;
                    const someSelected = selectedInGroup.length > 0 && !allSelected;

                    const handleSelectAll = (checked: boolean) => {
                        setRole((prev: typeof role) => {
                            const currentPermissions = new Set(prev.permissions);
                            if (checked) {
                                groupPermissions.forEach(p => currentPermissions.add(p));
                            } else {
                                groupPermissions.forEach(p => currentPermissions.delete(p));
                            }
                            return { ...prev, permissions: Array.from(currentPermissions) };
                        });
                    };

                    return (
                        <div key={key} className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => handleToggleGroup(key)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-800/40 focus-visible:bg-slate-800/40 transition focus-ring"
                                aria-expanded={openGroup === key}
                            >
                                <h4 className="text-lg font-semibold text-white">{group.title}</h4>
                                <AccordionIcon isOpen={openGroup === key} />
                            </button>
                            {openGroup === key && (
                                <div className="p-4 border-t border-slate-700/50 space-y-4 animate-fade-in">
                                    <div className="border-b border-slate-700/50 pb-3">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                ref={(el: HTMLInputElement | null) => { 
                                                    if (el) el.indeterminate = someSelected; 
                                                }}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
                                                className="form-checkbox"
                                            />
                                            <span className="font-semibold text-slate-300">Marcar todos</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                        {Object.entries(group.permissions).map(([perm, desc]) => (
                                            <label key={perm} className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={role.permissions.includes(perm as Permission)}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePermissionChange(perm as Permission, e.target.checked)}
                                                    className="form-checkbox"
                                                />
                                                <span className="text-slate-300">{desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Perfil</button>
            </div>
        </form>
    );
};

export default RoleForm;