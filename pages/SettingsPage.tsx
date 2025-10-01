import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import type { LayoutSettings, PaymentMethod, Permission, Company, CompanyLicense, Role, ProfileRow } from '../types';
import { ICONS } from '../constants';
import Modal from '../components/Modal';
import PaymentMethodForm from '../components/forms/PaymentMethodForm';
import UserForm from '../components/forms/UserForm';
import { triggerImport, initialLayoutSettings } from '../utils/helpers';
import { formatCurrency } from '../utils/helpers';
import { supabase } from '../services/supabaseClient';

interface SettingsPageProps {
    layoutSettings: LayoutSettings;
    onSaveLayoutSettings: (settings: LayoutSettings) => void;
    paymentMethods: PaymentMethod[];
    onSavePaymentMethod: (data: { originalName: string | null, newName: string, newBalance: number }) => {success: boolean, message?: string};
    onDeletePaymentMethod: (name: string) => {success: boolean, message?: string};
    logoUrl: string | null;
    onLogoUpload: (file: File) => void;
    onLogoRemove: () => void;
    hasPermission: (p: Permission) => boolean;
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
    company: Company | null;
    license: CompanyLicense | null;
    onActivationSuccess: () => void;
    users: ProfileRow[];
    roles: Role[];
    onAddUser: (data: { name: string, email: string, password: string, roleId: string }) => Promise<{ success: boolean, message: string }>;
}

const SettingsPage: React.FC<SettingsPageProps> = (props: SettingsPageProps) => {
    const { 
        layoutSettings,
        onSaveLayoutSettings,
        paymentMethods,
        onSavePaymentMethod,
        onDeletePaymentMethod,
        logoUrl,
        onLogoUpload,
        onLogoRemove,
        hasPermission,
        onExport,
        onImport,
        onReset,
        company,
        license,
        onActivationSuccess,
        users,
        roles,
        onAddUser
    } = props;

    const [settings, setSettings] = useState<LayoutSettings>(initialLayoutSettings);
    const [editingMethod, setEditingMethod] = useState<({ originalName: string | null } & Partial<PaymentMethod>) | null>(null);
    const [saveStatus, setSaveStatus] = useState('');
    const [licenseKey, setLicenseKey] = useState('');
    const [licenseMessage, setLicenseMessage] = useState({ type: '', text: '' });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (layoutSettings && typeof layoutSettings === 'object') {
            setSettings(layoutSettings);
        }
    }, [layoutSettings]);
    
    const handleActivateLicense = async () => {
        if (!licenseKey.trim() || !company) {
            setLicenseMessage({ type: 'error', text: 'Por favor, insira uma chave de licença válida.' });
            return;
        }
        setLicenseMessage({ type: 'loading', text: 'A validar...' });
        
        // 1. Find the license
        const { data: license, error: licenseError } = await supabase
            .from('licenses')
            .select('*')
            .eq('key', licenseKey.trim())
            .eq('is_active', true)
            .single();

        if (licenseError || !license) {
            setLicenseMessage({ type: 'error', text: 'Chave de licença inválida ou já utilizada.' });
            return;
        }

        // 2. Check if this company already used this license
        const { data: existingActivation } = await supabase
            .from('company_licenses')
            .select('id')
            .eq('company_id', company.id)
            .eq('license_id', license.id)
            .single();
        
        if (existingActivation) {
            setLicenseMessage({ type: 'error', text: 'Esta chave de licença já foi ativada por sua empresa.' });
            return;
        }

        // 3. Activate the license for the company
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + license.duration_days);

        const { error: insertError } = await supabase.from('company_licenses').insert({
            company_id: company.id,
            license_id: license.id,
            expires_at: expires_at.toISOString()
        });
        
        if (insertError) {
             setLicenseMessage({ type: 'error', text: `Erro ao ativar: ${insertError.message}` });
             return;
        }

        // 4. Deactivate the key so it cannot be reused
        await supabase.from('licenses').update({ is_active: false }).eq('id', license.id);

        const successText = `Licença "${license.description || 'Padrão'}" ativada com sucesso! O seu acesso foi extendido por ${license.duration_days} dias.`;
        setLicenseMessage({ type: 'success', text: successText });
        setTimeout(onActivationSuccess, 3000);
    };

    const handleLayoutChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement; // Cast to access 'checked'
        
        if (type === 'checkbox') {
            setSettings((prev: LayoutSettings) => ({...prev, [name]: target.checked }));
        } else {
            const parsedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
            setSettings((prev: LayoutSettings) => ({ ...prev, [name]: parsedValue }));
        }
    };
    
    const handleLayoutSave = (e: FormEvent) => {
        e.preventDefault();
        onSaveLayoutSettings(settings);
        setSaveStatus('Definições guardadas com sucesso!');
        setTimeout(() => setSaveStatus(''), 3000);
    };
    
    const handlePaymentMethodSave = (data: { originalName: string | null, newName: string, newBalance: number }) => {
        const result = onSavePaymentMethod(data);
        if (result.success) {
            setEditingMethod(null);
        } else if (result.message) {
            alert(result.message);
        }
    };

    const handlePaymentMethodDelete = (name: string) => {
        if (window.confirm(`Tem a certeza que quer remover "${name}"? Esta ação não pode ser desfeita.`)) {
            const result = onDeletePaymentMethod(name);
            if (!result.success && result.message) {
                alert(result.message);
            }
        }
    };
    
    const handleLogoSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert("O ficheiro é demasiado grande. Por favor, escolha uma imagem com menos de 2MB.");
                    return;
                }
                setSelectedLogoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };
    
    const handleConfirmLogoUpload = () => {
        if (selectedLogoFile) {
            onLogoUpload(selectedLogoFile);
            setSelectedLogoFile(null);
            setLogoPreviewUrl(null);
        }
    };

    const handleCancelLogoUpload = () => {
        setSelectedLogoFile(null);
        setLogoPreviewUrl(null);
    };
    
    const handleOpenUserModal = () => {
        if (users.length >= 4) {
            alert("A sua licença permite um máximo de 4 utilizadores.");
            return;
        }
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (data: { name: string, email: string, password: string, roleId: string }) => {
        const result = await onAddUser(data);
        if (result.success) {
            alert(result.message);
            setIsUserModalOpen(false);
        } else {
            alert(result.message);
        }
    };

    const handleLicenseKeyChange = (e: ChangeEvent<HTMLInputElement>) => setLicenseKey(e.target.value);

    const trialEndsAt = company ? new Date(company.trial_ends_at) : null;
    const licenseExpiresAt = license ? new Date(license.expires_at) : null;
    const now = new Date();
    let statusMessage = '';

    if (licenseExpiresAt && licenseExpiresAt > now) {
        statusMessage = `A sua licença está ativa e expira a ${licenseExpiresAt.toLocaleDateString('pt-PT')}.`;
    } else if (trialEndsAt && trialEndsAt > now) {
        statusMessage = `O seu período de teste gratuito termina a ${trialEndsAt.toLocaleDateString('pt-PT')}.`;
    } else {
        statusMessage = 'A sua subscrição expirou. Por favor, ative uma nova licença para continuar a usar a aplicação.'
    }

    return (
        <div className="space-y-12">
            <h1 className="text-3xl font-bold text-white">Definições</h1>

            {hasPermission('manage_settings') && (
                <>
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Aparência & Faturação</h2>
                        <form onSubmit={handleLayoutSave} className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
                            {/* Section for company details */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Dados da Empresa para Faturação</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="companyName" value={settings.companyName} onChange={handleLayoutChange} placeholder="Nome da Empresa" className="form-input" />
                                    <input name="footerNuit" value={settings.footerNuit} onChange={handleLayoutChange} placeholder="NUIT da Empresa" className="form-input" />
                                    <input name="footerContact" value={settings.footerContact} onChange={handleLayoutChange} placeholder="Contacto da Empresa" className="form-input" />
                                    <input name="footerAddress" value={settings.footerAddress} onChange={handleLayoutChange} placeholder="Endereço da Empresa" className="form-input" />
                                </div>
                            </div>

                            {/* Section for document titles */}
                            <div className="pt-4 border-t border-slate-600">
                                <h3 className="text-lg font-semibold text-white mb-3">Títulos dos Documentos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input name="quotationTitle" value={settings.quotationTitle} onChange={handleLayoutChange} placeholder="Título da Cotação" className="form-input" />
                                    <input name="invoiceTitle" value={settings.invoiceTitle} onChange={handleLayoutChange} placeholder="Título da Fatura/Recibo" className="form-input" />
                                    <input name="collectionInvoiceTitle" value={settings.collectionInvoiceTitle} onChange={handleLayoutChange} placeholder="Título Fatura de Cobrança" className="form-input" />
                                </div>
                            </div>

                            {/* Section for footer message */}
                            <div className="pt-4 border-t border-slate-600">
                                <h3 className="text-lg font-semibold text-white mb-3">Mensagem de Rodapé</h3>
                                <textarea name="footerMessage" value={settings.footerMessage} onChange={handleLayoutChange} placeholder="Mensagem de Rodapé" rows={2} className="form-textarea"/>
                            </div>

                            {/* Section for Tax and Numbering */}
                            <div className="pt-4 border-t border-slate-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Imposto</h3>
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" id="taxEnabled" name="taxEnabled" checked={settings.taxEnabled} onChange={handleLayoutChange} className="form-checkbox"/>
                                        <label htmlFor="taxEnabled" className="flex-grow">Ativar Imposto</label>
                                        <input name="taxName" value={settings.taxName} onChange={handleLayoutChange} placeholder="Nome (Ex: IVA)" className="form-input w-24" disabled={!settings.taxEnabled} />
                                        <input name="taxRate" type="number" value={settings.taxRate} onChange={handleLayoutChange} placeholder="Taxa (%)" className="form-input w-24" disabled={!settings.taxEnabled} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Numeração de Faturas</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="invoicePrefix" value={settings.invoicePrefix || ''} onChange={handleLayoutChange} placeholder="Prefixo da Fatura" className="form-input" />
                                        <input name="invoiceNextNumber" type="number" value={settings.invoiceNextNumber || 1} onChange={handleLayoutChange} placeholder="Próximo Nº" className="form-input" />
                                    </div>
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-600">
                                {saveStatus && <p className="text-green-400">{saveStatus}</p>}
                                <button type="submit" className="btn btn-primary">Guardar Alterações</button>
                            </div>
                        </form>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Logo da Empresa</h2>
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                                    {logoPreviewUrl ? (
                                        <img src={logoPreviewUrl} alt="Pré-visualização" className="h-full w-full object-contain rounded" />
                                    ) : logoUrl ? (
                                        <img src={logoUrl} alt="Logo Atual" className="h-full w-full object-contain rounded" />
                                    ) : (
                                        <span className="text-slate-500 text-sm">Sem Logo</span>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-slate-400 mb-2">
                                        {logoPreviewUrl ? "Pré-visualização do novo logo. Clique em 'Confirmar' para guardar." : "Faça o upload do logo para aparecer nas suas faturas (PNG ou JPG, max 2MB)."}
                                    </p>
                                    <div className="flex gap-4">
                                        {!selectedLogoFile ? (
                                            <>
                                                <button type="button" onClick={handleLogoSelect} className="btn btn-secondary">Carregar Logo</button>
                                                {logoUrl && <button type="button" onClick={onLogoRemove} className="btn bg-slate-600 hover:bg-slate-500">Remover Logo</button>}
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" onClick={handleConfirmLogoUpload} className="btn btn-primary">Confirmar</button>
                                                <button type="button" onClick={handleCancelLogoUpload} className="btn bg-slate-600 hover:bg-slate-500">Cancelar</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                     <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Métodos de Pagamento & Saldos</h2>
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {paymentMethods.map((method: PaymentMethod) => (
                                    <div key={method.name} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{method.name}</p>
                                            <p className="text-sm text-slate-400">Saldo inicial: {formatCurrency(method.initialBalance)}</p>
                                        </div>
                                        <div className="flex gap-1">
                                             <button onClick={() => setEditingMethod({ originalName: method.name, name: method.name, initialBalance: method.initialBalance })} className="btn-icon text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                                            <button onClick={() => handlePaymentMethodDelete(method.name)} className="btn-icon text-red-500 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setEditingMethod({ originalName: null })} className="btn bg-green-600 hover:bg-green-700">Adicionar Método</button>
                        </div>
                    </section>
                </>
            )}
            
            {hasPermission('manage_users') && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Gestão de Utilizadores</h2>
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <div className="space-y-3 mb-4">
                            {users.map((user: ProfileRow) => {
                                const role = roles.find((r: Role) => r.id === user.role_id);
                                return (
                                    <div key={user.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                                        <p className="font-semibold">{user.name}</p>
                                        <span className="text-sm bg-slate-600 px-2 py-1 rounded-full">{role?.name || 'Sem Perfil'}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {users.length < 4 ? (
                            <button onClick={handleOpenUserModal} className="btn btn-secondary">Adicionar Utilizador</button>
                        ) : (
                            <p className="text-sm text-slate-400">Atingiu o limite de 4 utilizadores para a sua licença.</p>
                        )}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Gestão de Licença</h2>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <p className="text-slate-300 mb-1">{statusMessage}</p>
                    <p className="text-slate-400 mb-4 text-sm">Para extender o seu plano, insira uma nova chave de licença abaixo.</p>
                    <div className="flex items-center gap-4">
                        <input 
                            type="text" 
                            value={licenseKey} 
                            onChange={handleLicenseKeyChange}
                            placeholder="Insira a sua chave de licença"
                            className="form-input"
                        />
                        <button 
                            onClick={handleActivateLicense} 
                            disabled={licenseMessage.type === 'loading'}
                            className="btn bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed"
                        >
                            Ativar
                        </button>
                    </div>
                    {licenseMessage.text && (
                        <p className={`mt-3 text-sm ${
                            licenseMessage.type === 'error' ? 'text-red-400' :
                            licenseMessage.type === 'success' ? 'text-green-400' : 'text-slate-400'
                        }`}>
                            {licenseMessage.text}
                        </p>
                    )}
                </div>
            </section>
            
             {hasPermission('perform_backup') && (
                <section>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">{ICONS.DANGER_ZONE} Zona de Perigo</h2>
                    <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Exportar Backup</h3>
                                <p className="text-sm text-slate-400">Descarregar um ficheiro JSON com todos os dados da sua empresa.</p>
                            </div>
                            <button onClick={onExport} className="btn bg-slate-600 hover:bg-slate-500">{ICONS.DOWNLOAD} Exportar</button>
                        </div>
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Importar Backup</h3>
                                <p className="text-sm text-slate-400">Substituir todos os dados atuais pelos dados de um ficheiro de backup.</p>
                            </div>
                            <button onClick={() => triggerImport(onImport)} className="btn bg-slate-600 hover:bg-slate-500">{ICONS.UPLOAD} Importar</button>
                        </div>
                        {hasPermission('reset_database') && (
                            <div className="flex justify-between items-center pt-4 border-t border-red-500/30">
                                <div>
                                    <h3 className="font-bold text-red-400">Reiniciar Base de Dados</h3>
                                    <p className="text-sm text-slate-400">Apagar permanentemente todos os dados (faturas, clientes, etc).</p>
                                </div>
                                <button onClick={onReset} className="btn btn-danger">Reiniciar Dados</button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {editingMethod && (
                <Modal isOpen={!!editingMethod} onClose={() => setEditingMethod(null)} title={editingMethod.originalName ? "Editar Método" : "Novo Método"}>
                    <PaymentMethodForm item={editingMethod} onSave={handlePaymentMethodSave} onCancel={() => setEditingMethod(null)} />
                </Modal>
            )}

            {isUserModalOpen && (
                <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Adicionar Novo Utilizador">
                    <UserForm onSave={handleSaveUser} onCancel={() => setIsUserModalOpen(false)} roles={roles} />
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;