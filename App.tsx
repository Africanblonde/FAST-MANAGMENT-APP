import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NAV_ITEMS, ICONS } from './constants';
import type { Client, Vehicle, Service, Part, Invoice, InvoiceRow, InvoiceItem, Expense, PaymentMethod, LayoutSettings, Supplier, Purchase, Employee, SalaryAdvance, Role, Permission, Occurrence, InvoicePayment, Asset, ExtraReceipt, AssetCategory, AssetLocation, Database, Profile, Company, CompanyLicense, ProfileRow, Settings, SupplierRow, User, AdminDashboardData } from './types';
import { downloadJson, readFileAsText, initialLayoutSettings, initialPaymentMethods } from './utils/helpers';
import { supabase } from './services/supabaseClient';
import { getAdminDashboardData } from './services/superAdminService';
import type { AuthChangeEvent, Session, PostgrestError } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { addToSyncQueue, getSyncQueue, deleteFromSyncQueue } from './utils/offlineSync';

import Modal from './components/Modal';
import InvoiceViewClean from './components/ui/InvoiceViewClean';
import LandingPage from './components/ui/LandingPage';
import LoginPage from './components/ui/LoginPage';
import RegistrationPage from './components/ui/RegistrationPage';
import PasswordResetRequestPage from './components/ui/PasswordResetRequestPage';
import UpdatePasswordPage from './components/ui/UpdatePasswordPage';
import CompleteRegistrationPage from './components/ui/CompleteRegistrationPage';
import { useLanguage } from './contexts/LanguageContext';

// Forms
import ExpenseForm from './components/forms/ExpenseForm';
import ClientForm from './components/forms/ClientForm';
import SupplierForm from './components/forms/SupplierForm';
import VehicleForm from './components/forms/VehicleForm';
import ServiceForm from './components/forms/ServiceForm';
import PartForm from './components/forms/PartForm';
import RoleForm from './components/forms/RoleForm';
import EmployeeForm from './components/forms/EmployeeForm';
import SalaryAdvanceForm from './components/forms/SalaryAdvanceForm';
import InvoiceForm from './components/forms/InvoiceForm';
import CustomItemForm from './components/forms/CustomItemForm';
import PaymentForm from './components/forms/PaymentForm';
import EditPaymentForm from './components/forms/EditPaymentForm';
import PurchasePaymentForm from './components/forms/PurchasePaymentForm';
import SupplierPurchaseForm from './components/forms/SupplierPurchaseForm';
import AssetForm from './components/forms/AssetForm';
import AssetCategoryForm from './components/forms/AssetCategoryForm';
import AssetLocationForm from './components/forms/AssetLocationForm';
import { ExtraReceiptForm } from './pages/RecebimentosPage';

// Pages
import Dashboard from './pages/Dashboard';
import AIDiagnosticsPage from './pages/AIDiagnosticsPage';
import ClientsPage from './pages/ClientsPage';
import VehiclesPage from './pages/VehiclesPage';
import ServicesPage from './pages/ServicesPage';
import PartsPage from './pages/PartsPage';
import InvoicingPage from './pages/InvoicingPage';
import ExpensesPage from './pages/ExpensesPage';
import SettingsPage from './pages/SettingsPage';
import PermissionsPage from './pages/PermissionsPage';
import EmployeesPage from './pages/EmployeesPage';
import SuppliersPage from './pages/SuppliersPage';
import StatementPage from './pages/StatementPage';
import ClientCreditPage from './pages/ClientCreditPage';
import LoyalClientsPage from './pages/LoyalClientsPage';
import OccurrencesPage from './pages/OccurrencesPage';
import ReportsPage from './pages/ReportsPage';
import RecebimentosPage from './pages/RecebimentosPage';
import PatrimonioPage from './pages/PatrimonioPage';
import AssetCategoriesPage from './pages/AssetCategoriesPage';
import AssetLocationsPage from './pages/AssetLocationsPage';
import ExpiredPage from './pages/ExpiredPage';
import SuperAdminPage from './pages/SuperAdminPage';
import ClientFinancialDashboardPage from './pages/ClientFinancialDashboardPage';
declare global {
    namespace JSX {
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
  }
export type ViewMode = 'landing' | 'login' | 'registration' | 'app' | 'loading' | 'expired' | 'passwordResetRequest' | 'updatePassword' | 'completeRegistration' | 'superAdmin';

const createNewInvoiceDraft = (companyId: string): Invoice => ({
    id: `draft-${uuidv4()}`,
    display_id: null,
    company_id: companyId,
    clientId: '',
    vehicleId: '',
    clientName: '',
    vehicleLicensePlate: '',
    items: [],
    payments: [],
    subtotal: 0,
    total: 0,
    taxAmount: 0,
    taxApplied: false,
    issueDate: new Date().toISOString(),
    status: 'Pendente',
    description: '',
    discount: 0,
    discountType: 'fixed',
    created_at: new Date().toISOString(),
    follow_up_completed_at: null,
});

// Helper function for showing detailed API errors
const showApiError = (message: string, error: any) => {
    console.error(message, error);
    let details = "Ocorreu um erro inesperado.";

    if (error && typeof error === 'object') {
        // Handle Supabase/PostgREST style errors
        if (typeof error.message === 'string') {
            details = `Detalhes: ${error.message}`;
            if (typeof error.hint === 'string' && error.hint) {
                details += `\n\nSugestão: ${error.hint}`;
            }
        } else {
            // Fallback for other kinds of objects
            try {
                const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
                details = `Detalhes do Erro (JSON):\n${errorString}`;
            } catch {
                details = "Não foi possível mostrar os detalhes do erro. Verifique a consola do navegador.";
            }
        }
    } else if (error) {
        // Handle primitive errors (strings, numbers)
        details = `Detalhes: ${String(error)}`;
    }
    
    alert(`${message}\n\n${details}`);
};

export const App: React.FC = () => {
    const { t } = useLanguage();

    // Helper function to get navigation labels with translations
    const getNavLabel = (itemId: string): string => {
        const navTranslationMap: Record<string, string> = {
            'dashboard': t('nav.dashboard'),
            'ai_diagnostics': 'Diagnóstico IA', // Custom label
            'invoices': t('nav.invoices'),
            'recebidos': t('nav.receivables'),
            'clients': t('nav.clients'),
            'vehicles': t('nav.vehicles'),
            'services': t('nav.services'),
            'parts': t('nav.parts'),
            'assets': 'Património', // Custom label
            'suppliers': t('nav.suppliers'),
            'employees': t('nav.employees'),
            'expenses': 'Despesas', // Custom label
            'reports': t('nav.reports'),
            'statement': 'Extrato de Conta', // Custom label
            'client_credit': 'Crédito de Clientes', // Custom label
            'loyal_clients': 'Clientes VIP', // Custom label
            'occurrences': 'Ocorrências', // Custom label
            'permissions': 'Perfis & Permissões', // Custom label
            'settings': t('nav.settings'),
        };
        
        return navTranslationMap[itemId] || itemId;
    };
    // --- State Management ---
    const [viewMode, setViewMode] = useState<ViewMode>('loading');
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [license, setLicense] = useState<CompanyLicense | null>(null);
    const [activePage, setActivePage] = useState<string>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Data states
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
    const [assetLocations, setAssetLocations] = useState<AssetLocation[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
    const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(initialLayoutSettings);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
    const [extraReceipts, setExtraReceipts] = useState<ExtraReceipt[]>([]);
    const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalSize, setModalSize] = useState<'md' | 'xl' | '3xl' | '5xl'>('md');
    
    // Quick Sale state
    const [quickSaleDraft, setQuickSaleDraft] = useState<Invoice>(createNewInvoiceDraft(''));

    // Viewing states
    const [viewingClientFinancials, setViewingClientFinancials] = useState<Client | null>(null);


    // Offline Sync State
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState('');
    
    // --- Initial Load & Auth Listener ---
    const loadInitialData = useCallback(async (currentSession: Session) => {
        if (!currentSession?.user) return;
        
        setViewMode('loading');

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, company:companies(*)')
            .eq('id', currentSession.user.id)
            .single() as { data: Profile | null, error: PostgrestError | null };

        if (profileError) {
            if (profileError.message.toLowerCase().includes('jwt expired')) {
                console.warn("Sessão expirada. A efetuar logout.");
                alert("A sua sessão expirou. Por favor, inicie sessão novamente para continuar.");
                await supabase.auth.signOut();
                return;
            }
            if (profileError.code === 'PGRST116') {
                setViewMode('completeRegistration');
                return;
            }
            console.error("Erro ao carregar o perfil:", profileError);
            showApiError("Erro ao carregar o seu perfil. A sessão será terminada por segurança.", profileError);
            await supabase.auth.signOut();
            return;
        }

        if (profileData?.is_super_admin) {
            try {
                const data = await getAdminDashboardData();
                setAdminData(data);
                setViewMode('superAdmin');
            } catch (error) {
                showApiError("Erro ao carregar dados de Super Admin", error);
                await supabase.auth.signOut();
            }
            return;
        }

        if (!profileData || !profileData.company) {
            setViewMode('completeRegistration');
            return;
        }
        
        setProfile(profileData);
        setCompany(profileData.company);

        const { data: licenseData } = await supabase
            .from('company_licenses')
            .select('*')
            .eq('company_id', profileData.company_id)
            .order('expires_at', { ascending: false })
            .limit(1)
            .single();

        const trialEndsAt = new Date(profileData.company.trial_ends_at || 0);
        const licenseExpiresAt = licenseData ? new Date(licenseData.expires_at) : new Date(0);
        if (new Date() > trialEndsAt && new Date() > licenseExpiresAt) {
            setViewMode('expired');
            return;
        }
        if(licenseData) setLicense(licenseData as CompanyLicense);
        
        const companyId = profileData.company_id;
        const [
            clientsRes, vehiclesRes, servicesRes, partsRes, assetsRes, assetCatsRes, assetLocsRes,
            invoicesRes, expensesRes, usersRes, rolesRes, suppliersRes, purchasesRes,
            employeesRes, advancesRes, occurrencesRes, extraReceiptsRes, settingsRes
        ] = await Promise.all([
            supabase.from('clients').select('*').eq('company_id', companyId),
            supabase.from('vehicles').select('*').eq('company_id', companyId),
            supabase.from('services').select('*').eq('company_id', companyId),
            supabase.from('parts').select('*').eq('company_id', companyId),
            supabase.from('assets').select('*').eq('company_id', companyId),
            supabase.from('asset_categories').select('*').eq('company_id', companyId),
            supabase.from('asset_locations').select('*').eq('company_id', companyId),
            supabase.from('invoices').select('*, items:invoice_items(*), payments:invoice_payments(*)').eq('company_id', companyId),
            supabase.from('expenses').select('*').eq('company_id', companyId),
            supabase.from('profiles').select('*').eq('company_id', companyId),
            supabase.from('roles').select('*').eq('company_id', companyId),
            supabase.from('suppliers').select('*').eq('company_id', companyId),
            supabase.from('purchases').select('*').eq('company_id', companyId),
            supabase.from('employees').select('*').eq('company_id', companyId),
            supabase.from('salary_advances').select('*').eq('company_id', companyId),
            supabase.from('occurrences').select('*').eq('company_id', companyId),
            supabase.from('extra_receipts').select('*').eq('company_id', companyId),
            supabase.from('settings').select('*').eq('company_id', companyId).single()
        ]);

        setClients(clientsRes.data || []); setVehicles(vehiclesRes.data || []); setServices(servicesRes.data || []);
        setParts(partsRes.data || []); setAssets(assetsRes.data || []); setAssetCategories(assetCatsRes.data || []);
// FIX: Changed type casting for invoices from Supabase to `any` to resolve a complex type mismatch error.
        setAssetLocations(assetLocsRes.data || []); setInvoices(invoicesRes.data as any || []); setExpenses(expensesRes.data || []);
        setUsers(usersRes.data || []); setRoles(rolesRes.data || []); setSuppliers(suppliersRes.data || []);
        setPurchases(purchasesRes.data || []); setEmployees(employeesRes.data || []); setSalaryAdvances(advancesRes.data || []);
        setOccurrences(occurrencesRes.data || []); setExtraReceipts(extraReceiptsRes.data || []);

        const settingsData = settingsRes.data as Settings | null;
        if (settingsData) {
            setLayoutSettings(settingsData.layout_settings as LayoutSettings || initialLayoutSettings);
            setPaymentMethods(settingsData.payment_methods as PaymentMethod[] || initialPaymentMethods);
            setLogoUrl(settingsData.logo_url || null);
        }
        
        setQuickSaleDraft(createNewInvoiceDraft(companyId));
        setViewMode('app');
    }, []);

    useEffect(() => {
        let authSubscription: any = null;

        const checkAuthAndSubscribe = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (!session) {
                const hash = window.location.hash;
                if (hash.includes('type=recovery')) {
                    setViewMode('updatePassword');
                } else {
                    setViewMode('landing');
                }
            } else {
                await loadInitialData(session);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
                setSession(session);
                
                if (_event === 'PASSWORD_RECOVERY') {
                    setViewMode('updatePassword');
                    return;
                }

                if (session) {
                    loadInitialData(session);
                } else {
                    setViewMode((currentView: ViewMode) => {
                        const publicViews: ViewMode[] = ['landing', 'login', 'registration', 'passwordResetRequest', 'updatePassword'];
                        if (publicViews.includes(currentView)) {
                            return currentView;
                        }
                        return 'login';
                    });
                    // Clear all data on logout
                    setProfile(null);
                    setCompany(null);
                    setLicense(null);
                    setClients([]); setVehicles([]); setServices([]); setParts([]); setAssets([]);
                    setAssetCategories([]); setAssetLocations([]); setInvoices([]); setExpenses([]);
                    setUsers([]); setRoles([]); setSuppliers([]); setPurchases([]); setEmployees([]);
                    setSalaryAdvances([]); setOccurrences([]); setExtraReceipts([]);
                    setAdminData(null);
                }
            });
            authSubscription = subscription;
        };

        checkAuthAndSubscribe();

        return () => {
            authSubscription?.unsubscribe();
        };
    }, [loadInitialData]);


     // --- Offline Sync Effects ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        const checkQueue = async () => {
            const queue = await getSyncQueue();
            setPendingSyncCount(queue.length);
        };
        checkQueue();
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSaveInvoiceOnline = useCallback(async (invoice: Invoice) => {
        if (!company) return null;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isOffline, items, payments, ...invoiceData } = invoice;
        (invoiceData as Partial<InvoiceRow>).company_id = company.id;

        let savedInvoice: InvoiceRow | null = null;
        const isUpdate = invoice.id && !invoice.id.startsWith('draft-') && !invoice.id.startsWith('offline-');

        if (isUpdate) {
            const { data, error } = await supabase.from('invoices').update(invoiceData).eq('id', invoice.id).select().single();
            if (error) { showApiError("Erro ao atualizar fatura", error); return null; }
            savedInvoice = data;
            if (savedInvoice) { // only delete if update was successful
                await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
            }
        } else {
            // --- NEW SEQUENTIAL ID LOGIC ---
            const { data: settings, error: settingsError } = await supabase.from('settings').select('layout_settings').eq('company_id', company.id).single();
            if (settingsError || !settings) {
                showApiError("Erro crítico: Não foi possível ler as definições de faturação para gerar o número da fatura.", settingsError);
                return null;
            }

            const currentLayoutSettings = settings.layout_settings as LayoutSettings;
            const prefix = currentLayoutSettings.invoicePrefix || 'F-';
            const nextNumber = currentLayoutSettings.invoiceNextNumber || 1;
            const displayId = `${prefix}${String(nextNumber).padStart(6, '0')}`;
            invoiceData.display_id = displayId;

            const newLayoutSettings = { ...currentLayoutSettings, invoiceNextNumber: nextNumber + 1 };
            await supabase.from('settings').update({ layout_settings: newLayoutSettings }).eq('company_id', company.id);

            setLayoutSettings(newLayoutSettings);
            // --- END OF SEQUENTIAL ID LOGIC ---

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...newInvoiceData } = invoiceData;
            const { data, error } = await supabase.from('invoices').insert(newInvoiceData as any).select().single();
            if (error) { showApiError("Erro ao criar fatura", error); return null; }
            savedInvoice = data;
        }
        
        if (!savedInvoice) {
            showApiError("Falha ao guardar fatura", "A operação na base de dados não retornou a fatura guardada.");
            return null;
        }

        const itemsToInsert = items.map(item => ({ ...item, company_id: company.id, invoice_id: savedInvoice!.id, id: uuidv4() }));
        const { data: insertedItems, error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert).select();
        if (itemsError) showApiError("Erro ao guardar itens da fatura", itemsError);

        const finalInvoice: Invoice = { ...(savedInvoice as Invoice), items: insertedItems || [], payments: isUpdate ? payments : [] };

        setInvoices((prev: Invoice[]) => {
            const existing = prev.find((i: Invoice) => i.id === invoice.id);
            if (existing) {
                return prev.map((i: Invoice) => i.id === invoice.id ? finalInvoice : i);
            }
            return [...prev, finalInvoice];
        });
        
        return finalInvoice;
    }, [company]);
    
    const handleDeleteInvoiceOnline = useCallback(async (id: string): Promise<Error | null> => {
        // This function now returns the error object on failure, or null on success.
        const { error: paymentError } = await supabase.from('invoice_payments').delete().eq('invoice_id', id);
        if (paymentError) return new Error(paymentError.message);
    
        const { error: itemsError } = await supabase.from('invoice_items').delete().eq('invoice_id', id);
        if (itemsError) return new Error(itemsError.message);
    
        const { data, error: invoiceError } = await supabase.from('invoices').delete().eq('id', id).select();
        if (invoiceError) return new Error(invoiceError.message);

        // If data is empty, the delete didn't happen (e.g., RLS).
        if (!data || data.length === 0) {
            return new Error("A fatura não foi apagada. Verifique as permissões da base de dados.");
        }

        return null; // Success
    }, []);


    useEffect(() => {
        const processSyncQueue = async () => {
            if (isOnline && pendingSyncCount > 0 && !isSyncing) {
                setIsSyncing(true);
                const queue = await getSyncQueue();
                
                for (const item of queue) {
                    try {
                        if (item.type === 'create' || item.type === 'update') {
                            await handleSaveInvoiceOnline(item.payload as Invoice);
                        } else if (item.type === 'delete') {
                            await handleDeleteInvoiceOnline(item.payload as string);
                        }
                        await deleteFromSyncQueue(item.id);
                        setPendingSyncCount((prev: number) => prev - 1);
                    } catch (error) {
                        console.error("Sync error:", error);
                        setIsSyncing(false); // Stop on error
                        return;
                    }
                }
                setIsSyncing(false);
            }
        };
        processSyncQueue();
    }, [isOnline, pendingSyncCount, isSyncing, handleSaveInvoiceOnline, handleDeleteInvoiceOnline]);
    
    const openModal = (title: string, content: React.ReactNode, size: 'md' | 'xl' | '3xl' | '5xl' = 'md') => {
        setModalTitle(title);
        setModalContent(content);
        setModalSize(size);
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    // --- CRUD Handlers ---

    const handleLicenseActivation = async () => {
        if (session) {
            await loadInitialData(session);
        } else {
            setViewMode('login');
        }
    };

    // FIX: Made the function generic to avoid "Type instantiation is excessively deep" errors with complex table types.
    // FIX: Using `any` for stateSetter to resolve "Type instantiation is excessively deep" error.
// FIX: Changed the 'table' parameter to be a keyof the Database tables to resolve type errors with supabase.from().
    const handleDelete = async (table: keyof Database['public']['Tables'], id: string, stateSetter: any, itemName: string) => {
        if (!window.confirm(`Tem a certeza que quer apagar este item: ${itemName}?`)) {
            return;
        }
        try {
            // Use .select() to get back the deleted items, which confirms the operation
            const { data, error } = await supabase.from(table).delete().eq('id', id).select();
            
            if (error) {
                throw error;
            }
            
            // If RLS is enabled and blocks the delete, data will be an empty array.
            if (!data || data.length === 0) {
                // This is not a PostgrestError, so showApiError will handle it as a generic message.
                throw new Error("A operação de apagar falhou. O item pode não existir ou pode não ter permissão para o apagar.");
            }

            // FIX: Explicitly typing the callback parameters to avoid deep type inference.
            stateSetter((prev: any[]) => prev.filter((item: { id: string }) => item.id !== id));
            alert(`${itemName} apagado com sucesso.`);
        } catch (error: any) {
            showApiError(`Erro ao apagar ${itemName}`, error);
            console.error(`Erro ao apagar ${itemName} da tabela ${table}:`, error);
        }
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setViewMode('login');
    };

    const handleSaveSettings = async (settings: Partial<Settings>) => {
        if (!company) return;
        try {
            const { data: existingSettings } = await supabase.from('settings').select('*').eq('company_id', company.id).single();
            const { error } = existingSettings 
                ? await supabase.from('settings').update(settings).eq('company_id', company.id)
                : await supabase.from('settings').insert({ ...settings, company_id: company.id } as Settings);

            if (error) throw error;

            if (settings.layout_settings) setLayoutSettings(settings.layout_settings as LayoutSettings);
            if (settings.payment_methods) setPaymentMethods(settings.payment_methods as PaymentMethod[]);
        } catch (error) {
            showApiError("Erro ao guardar definições", error);
        }
    };

    const handleSaveLayoutSettings = (newLayoutSettings: LayoutSettings) => {
        handleSaveSettings({ layout_settings: newLayoutSettings });
    };

    const handleLogoUpload = async (file: File) => {
        if (!company) return;
        try {
            const filePath = `${company.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
            const newLogoUrl = data.publicUrl;
            await handleSaveSettings({ logo_url: newLogoUrl });
            setLogoUrl(newLogoUrl);
            alert('O seu novo logo foi carregado e guardado com sucesso!');
        } catch (error: any) {
             showApiError("Erro ao carregar logo", error);
        }
    };

    const handleLogoRemove = async () => {
        if (!company || !logoUrl) return;
        try {
            const fileName = logoUrl.split('/').pop();
            if (fileName) {
                const { error } = await supabase.storage.from('logos').remove([`${company.id}/${fileName}`]);
                if (error) console.error("Error removing old logo:", error);
            }
            await handleSaveSettings({ logo_url: null });
            setLogoUrl(null);
        } catch (error) {
             showApiError("Erro ao remover o logo", error);
        }
    };
    
    const handleSaveClient = async (data: Partial<Client & Vehicle>) => {
        if (!company) return null;
        try {
            const clientData: Omit<Client, 'id' | 'created_at'> = {
                company_id: company.id,
                firstName: data.firstName!,
                middleName: data.middleName || null,
                lastName: data.lastName!,
                contact: data.contact!,
            };

            let finalClient: Client | null = null;
            if (data.id && !data.id.startsWith('draft')) { // Editing
                const { data: updatedClient, error } = await supabase.from('clients').update(clientData).eq('id', data.id).select().single();
                if (error) throw error;
                setClients((prev: Client[]) => prev.map((c: Client) => c.id === data.id ? updatedClient : c));
                finalClient = updatedClient;
            } else { // Adding
                const { data: newClient, error } = await supabase.from('clients').insert(clientData).select().single();
                if (error) throw error;
                if (newClient) {
                    setClients((prev: Client[]) => [...prev, newClient]);
                    finalClient = newClient;

                    if (data.licensePlate && data.model) {
                        const vehicleData: Omit<Vehicle, 'id' | 'created_at'> = {
                            company_id: company.id,
                            clientId: newClient.id,
                            licensePlate: data.licensePlate,
                            model: data.model,
                            type: data.type || 'Ligeiro'
                        };
                        const { data: newVehicle, error: vehicleError } = await supabase.from('vehicles').insert(vehicleData).select().single();
                        if (vehicleError) throw vehicleError;
                        if (newVehicle) {
                            setVehicles((prev: Vehicle[]) => [...prev, newVehicle]);
                        }
                    }
                }
            }
            closeModal();
            return finalClient;
        } catch (error) {
            showApiError('Erro ao guardar cliente', error);
            return null;
        }
    };

    const handleSaveVehicle = async (data: Partial<Vehicle>) => {
        if (!company) return;
        try {
            if (data.id && !data.id.startsWith('draft')) { // Editing
                const { id, created_at, company_id, ...updateData } = { ...data, company_id: company.id };
                const { data: updated, error } = await supabase.from('vehicles').update(updateData).eq('id', data.id).select().single();
                if (error) throw error;
                if (updated) {
                    setVehicles((prev: Vehicle[]) => prev.map((v: Vehicle) => v.id === data.id ? updated : v));
                }
            } else { // Adding
                const insertData: Omit<Vehicle, 'id' | 'created_at'> = {
                    company_id: company.id,
                    clientId: data.clientId!,
                    licensePlate: data.licensePlate!,
                    model: data.model!,
                    type: data.type!
                };
                const { data: added, error } = await supabase.from('vehicles').insert(insertData).select().single();
                if (error) throw error;
                if (added) {
                    setVehicles((prev: Vehicle[]) => [...prev, added]);
                }
            }
            closeModal();
        } catch (error) {
            showApiError("Erro ao guardar viatura", error);
        }
    };

    const handleAddUser = async (data: { name: string, email: string, password: string, roleId: string }): Promise<{ success: boolean, message: string }> => {
        if (!company) return { success: false, message: "Empresa não encontrada." };
        if (users.length >= 4) return { success: false, message: "A sua licença permite um máximo de 4 utilizadores." };
        if (!data.roleId) return { success: false, message: "Por favor, selecione um perfil para o utilizador." };

        try {
            // Criar um cliente Supabase separado para não interferir com a sessão atual
            const { createClient } = await import('@supabase/supabase-js');
            const adminSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY
            );

            const { error } = await adminSupabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        company_id: company.id,
                        role_id: data.roleId,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                }
            });

            if (error) {
                return { success: false, message: `Erro ao criar utilizador: ${error.message}` };
            }

            // Atualizar a lista de usuários após um pequeno delay
            setTimeout(async () => {
                const { data: usersData } = await supabase.from('profiles').select('*').eq('company_id', company.id);
                if (usersData) setUsers(usersData);
            }, 2000);

            return { success: true, message: "Convite enviado! O novo utilizador receberá um email de confirmação para ativar a sua conta." };
        } catch (error: any) {
            return { success: false, message: `Erro inesperado: ${error.message}` };
        }
    };

    // FIX: Using `any` for stateSetter to resolve "Type instantiation is excessively deep" error.
    const createCrudHandlers = <T extends { id: string, company_id: string }>(
        table: keyof Database['public']['Tables'],
        state: T[],
        // FIX: Changed type to 'any' to avoid deep type instantiation errors.
        stateSetter: any,
        FormComponent: React.FC<any>,
        title: string,
        extraProps: object = {}
    ) => {
        const handleSave = async (item: Partial<T>) => {
            if (!company) return;
            try {
                const itemData = { ...item, company_id: company.id };
                
                if (item.id && !item.id.startsWith('draft')) { // Update
                    const { data: updated, error } = await supabase.from(table).update(itemData as any).eq('id', item.id).select().single();
                    if (error) throw error;
// FIX: Casted the result of Supabase `update` operations to `unknown` first to resolve the strict type error.
                    // FIX: Using `any[]` for prev and `any` for i to avoid "Type instantiation is excessively deep" error.
                    stateSetter((prev: any[]) => prev.map((i: any) => i.id === item.id ? updated as unknown as T : i));
                } else { // Insert
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...insertData } = itemData;
                    const { data: added, error } = await supabase.from(table).insert(insertData as any).select().single();
                    if (error) throw error;
// FIX: Casted the result of Supabase `insert` operations to `unknown` first to resolve the strict type error.
                    // FIX: Using `any[]` for prev to avoid "Type instantiation is excessively deep" error.
                    stateSetter((prev: any[]) => [...prev, added as unknown as T]);
                }
                closeModal();
            } catch (error) {
                showApiError(`Erro ao guardar ${title}`, error);
            }
        };

        return {
            onAdd: () => openModal(`Nova ${title}`, <FormComponent item={{}} onSave={handleSave} onCancel={closeModal} {...extraProps} />),
            onEdit: (id: string) => {
                const item = state.find((i: T) => i.id === id);
                if (item) openModal(`Editar ${title}`, <FormComponent item={item} onSave={handleSave} onCancel={closeModal} {...extraProps} />);
            },
            onDelete: (id: string) => handleDelete(table, id, stateSetter as any, title),
            handleSave,
        };
    };

    const clientHandlers = {
        onAdd: () => openModal("Novo Cliente", <ClientForm item={{}} onSave={handleSaveClient} onCancel={closeModal} clients={clients} />),
        onEdit: (id: string) => {
            const client = clients.find((c: Client) => c.id === id);
            if (client) openModal("Editar Cliente", <ClientForm item={client} onSave={handleSaveClient} onCancel={closeModal} clients={clients} />);
        },
        onDelete: async (id: string) => {
            if (!window.confirm("Tem a certeza que quer apagar este cliente e todas as suas viaturas e faturas? Esta ação é irreversível.")) {
                return;
            }
            try {
                // Find all invoices for this client - CORREÇÃO APLICADA
                const clientInvoices = invoices.filter((inv: Invoice) => inv.clientId === id);
                
                // Delete each invoice and its related items
                for (const invoice of clientInvoices) {
                    const deleteError = await handleDeleteInvoiceOnline(invoice.id);
                    if (deleteError) {
                        // Throw to be caught by the catch block
                        throw new Error(`Erro ao apagar a fatura associada #${invoice.display_id || invoice.id}: ${deleteError.message}`);
                    }
                }
                
                const { error: vehicleError } = await supabase.from('vehicles').delete().eq('clientId', id);
                if (vehicleError) throw vehicleError;
    
                const { data, error: clientError } = await supabase.from('clients').delete().eq('id', id).select();
                if (clientError) throw clientError;
    
                if (!data || data.length === 0) {
                    throw new Error("O cliente não foi apagado. Verifique as permissões ou se ainda existem dados associados.");
                }
    
                // Update state - CORREÇÕES APLICADAS
                setInvoices((prev: Invoice[]) => prev.filter((inv: Invoice) => inv.clientId !== id));
                setVehicles((prev: Vehicle[]) => prev.filter((v: Vehicle) => v.clientId !== id));
                setClients((prev: Client[]) => prev.filter((c: Client) => c.id !== id));
                
                alert("Cliente e todos os dados associados apagados com sucesso.");
            } catch (error: any) {
                showApiError("Erro ao apagar cliente", error);
                console.error("Erro ao apagar cliente e dados associados:", error);
            }
        }
    };
    
    const vehicleHandlers = {
        onAdd: () => openModal("Nova Viatura", <VehicleForm item={{}} onSave={handleSaveVehicle} onCancel={closeModal} clients={clients} vehicles={vehicles} />),
        onEdit: (id: string) => {
            const vehicle = vehicles.find((v: Vehicle) => v.id === id);
            if (vehicle) openModal("Editar Viatura", <VehicleForm item={vehicle} onSave={handleSaveVehicle} onCancel={closeModal} clients={clients} vehicles={vehicles} />);
        },
// FIX: Cast state setter to 'any' to avoid "Type instantiation is excessively deep" error with complex types.
        onDelete: (id: string) => handleDelete('vehicles', id, setVehicles as any, 'viatura')
    };

    const serviceHandlers = createCrudHandlers('services', services, setServices, ServiceForm, 'Serviço');
    const partHandlers = createCrudHandlers('parts', parts, setParts, PartForm, 'Peça', { suppliers });
    
    const handleSaveSupplier = async (data: Partial<Supplier>) => {
        if (!company) return;
        try {
            const supplierData: Omit<SupplierRow, 'id' | 'created_at'> = {
                company_id: company.id,
                name: data.name!,
                contact: data.contact!,
            };

            if (data.id && !data.id.startsWith('draft')) { // Editing
                const { data: updated, error } = await supabase.from('suppliers').update(supplierData).eq('id', data.id).select().single();
                if (error) throw error;
                setSuppliers((prev: Supplier[]) => prev.map((s: Supplier) => s.id === data.id ? updated : s));
            } else { // Adding
                const { data: added, error } = await supabase.from('suppliers').insert(supplierData).select().single();
                if (error) throw error;
                if (added) setSuppliers((prev: Supplier[]) => [...prev, added]);
            }
            closeModal();
        } catch (error) {
            showApiError('Erro ao guardar fornecedor', error);
        }
    };

    const supplierHandlers = {
        onAdd: () => openModal('Novo Fornecedor', <SupplierForm item={{}} onSave={handleSaveSupplier} onCancel={closeModal} />),
        onEdit: (id: string) => {
            const supplier = suppliers.find((s: Supplier) => s.id === id);
            if(supplier) openModal('Editar Fornecedor', <SupplierForm item={supplier} onSave={handleSaveSupplier} onCancel={closeModal} />);
        },
        onDelete: (id: string) => handleDelete('suppliers', id, setSuppliers as any, 'fornecedor')
    };

    const employeeHandlers = createCrudHandlers('employees', employees, setEmployees, EmployeeForm, 'Funcionário');
    const roleHandlers = createCrudHandlers('roles', roles, setRoles, RoleForm, 'Perfil');
    const assetHandlers = createCrudHandlers('assets', assets, setAssets, AssetForm, 'Item de Património', { categories: assetCategories, locations: assetLocations, suppliers });
    const assetCategoryHandlers = createCrudHandlers('asset_categories', assetCategories, setAssetCategories, AssetCategoryForm, 'Categoria');
    const assetLocationHandlers = createCrudHandlers('asset_locations', assetLocations, setAssetLocations, AssetLocationForm, 'Localização');
    const expenseHandlers = createCrudHandlers('expenses', expenses, setExpenses, ExpenseForm, 'Despesa', { paymentMethods });
    const extraReceiptHandlers = createCrudHandlers('extra_receipts', extraReceipts, setExtraReceipts, ExtraReceiptForm, 'Receita Extra', { paymentMethods: paymentMethods.map((pm: PaymentMethod) => pm.name) });

    const handleSavePayment = useCallback(async (invoiceId: string, newPayments: Omit<InvoicePayment, 'id'|'company_id'|'invoice_id'|'created_at'>[]) => {
        if (!company) return;
        
        const paymentsToInsert: InvoicePayment[] = newPayments.map(p => ({
            ...p,
            id: uuidv4(),
            company_id: company.id,
            invoice_id: invoiceId,
            created_at: new Date().toISOString(),
            receiptNumber: p.receiptNumber || null,
        }));

        const { error } = await supabase.from('invoice_payments').insert(paymentsToInsert as any);

        if (error) {
            showApiError("Erro ao registar pagamento", error);
            return;
        }

        setInvoices((prevInvoices: Invoice[]) =>
            prevInvoices.map((inv: Invoice) =>
                inv.id === invoiceId
                    ? { ...inv, payments: [...(inv.payments || []), ...paymentsToInsert] as InvoicePayment[] }
                    : inv
            )
        );
        closeModal();
    }, [company]);
    
     const handleEditPayment = useCallback(async (updatedPayment: InvoicePayment) => {
        if (!company) return;

        const { error } = await supabase.from('invoice_payments').update(updatedPayment).eq('id', updatedPayment.id);
        if (error) {
            showApiError("Erro ao atualizar pagamento", error);
            return;
        }

        setInvoices((prev: Invoice[]) => prev.map((inv: Invoice) =>
            inv.id === updatedPayment.invoice_id
            ? { ...inv, payments: inv.payments.map((p: InvoicePayment) => p.id === updatedPayment.id ? updatedPayment : p) }
            : inv
        ));
        closeModal();
    }, [company]);
    
     const handleDeleteInvoicePayment = useCallback(async (paymentId: string, invoiceId: string) => {
        if (!window.confirm("Tem a certeza que quer apagar este pagamento?")) return;

        const { data, error } = await supabase.from('invoice_payments').delete().eq('id', paymentId).select();
        if (error) {
            showApiError("Erro ao apagar pagamento", error);
            return;
        }

        if (!data || data.length === 0) {
            showApiError("Erro ao apagar pagamento", "A operação falhou. Verifique as suas permissões.");
            return;
        }

        setInvoices((prev: Invoice[]) => prev.map((inv: Invoice) =>
            inv.id === invoiceId
            ? { ...inv, payments: inv.payments.filter((p: InvoicePayment) => p.id !== paymentId) }
            : inv
        ));
    }, []);

    const handleSaveInvoice = async (invoiceToSave: Invoice) => {
        const isOfflineSave = !isOnline;
    
        if (isOfflineSave) {
            // ... código do offline ...
        } else {
            const savedInvoice = await handleSaveInvoiceOnline(invoiceToSave);
            if (savedInvoice) {
                closeModal();
                openModal("Visualizar Factura Recibo", <InvoiceViewClean 
                    invoice={savedInvoice} 
                    client={clients.find((c: Client) => c.id === savedInvoice.clientId)}   // Correção 1
                    vehicle={vehicles.find((v: Vehicle) => v.id === savedInvoice.vehicleId)}   // Correção 2
                    layoutSettings={layoutSettings} 
                    logoUrl={logoUrl} 
                    isCollectionInvoice={true} 
                    onClose={closeModal} 
                />, '5xl');
            }
        }
    };
    
    const handleDeleteInvoice = async (id: string) => {
        if (!window.confirm("Tem a certeza que quer apagar esta fatura? Todos os pagamentos associados também serão apagados.")) return;
    
        if (!isOnline) {
            await addToSyncQueue({ type: 'delete', payload: id });
            setInvoices((prev: Invoice[]) => prev.filter((inv: Invoice) => inv.id !== id));
            setPendingSyncCount((prev: number) => prev + 1);
        } else {
            const error = await handleDeleteInvoiceOnline(id);
            if (error) {
                showApiError("Erro ao apagar fatura", error);
            } else {
                 setInvoices((prev: Invoice[]) => prev.filter((inv: Invoice) => inv.id !== id));
            }
        }
    };

    const handleSavePurchase = useCallback(async (data: { supplierId: string, description: string, amount: number, date: string, purchaseType: 'credit' | 'debit', paymentMethod: string }, fromInvoiceForm = false) => {
        if (!company) return { success: false, error: 'Empresa não encontrada' };

        try {
            // 1. Save the Purchase
            const purchaseData: Omit<Purchase, 'id'|'created_at'|'company_id'> = {
                supplierId: data.supplierId,
                description: data.description,
                amount: data.amount,
                date: data.date,
            };
            const { data: newPurchase, error: purchaseError } = await supabase.from('purchases').insert({ ...purchaseData, company_id: company.id }).select().single();
            if (purchaseError) {
                showApiError("Erro ao guardar compra", purchaseError);
                return { success: false, error: purchaseError.message };
            }
            if (!newPurchase) {
                showApiError("Erro ao guardar compra", "Não foi possível obter os dados da compra guardada.");
                return { success: false, error: 'Não foi possível obter os dados da compra guardada' };
            }
            setPurchases((prev: Purchase[]) => [...prev, newPurchase]);

            // 2. If it was paid on the spot, create an Expense
            if (data.purchaseType === 'debit') {
                const expenseData: Omit<Expense, 'id'|'created_at'|'company_id'> = {
                    description: `Compra: ${data.description}`,
                    amount: data.amount,
                    date: data.date,
                    type: 'Compra Fornecedor',
                    paymentMethod: data.paymentMethod,
                    purchaseId: newPurchase.id,
                    supplierId: data.supplierId,
                };
                const { data: newExpense, error: expenseError } = await supabase.from('expenses').insert({ ...expenseData, company_id: company.id }).select().single();
                if (expenseError) {
                    showApiError("Erro ao registar despesa da compra", expenseError);
                    return { success: false, error: expenseError.message };
                }
                if (newExpense) {
                    setExpenses((prev: Expense[]) => [...prev, newExpense]);
                }
            }
            
            // Only close modal if this is not being called from an invoice form
            if (!fromInvoiceForm) {
                closeModal();
            }
            
            return { success: true };
        } catch (error) {
            console.error('Erro inesperado ao guardar compra:', error);
            return { success: false, error: 'Erro inesperado ao guardar compra' };
        }
    }, [company]);
    
    const handlePayPurchase = useCallback(async (purchaseId: string, paymentMethod: string, amount: number) => {
        if (!company) return;
        const purchase = purchases.find((p: Purchase) => p.id === purchaseId);
        if (!purchase) {
            showApiError("Erro ao registar pagamento da compra", "Compra não encontrada.");
            return;
        }
        const expenseData: Omit<Expense, 'id'|'created_at'|'company_id'> = {
            description: `Pagamento: ${purchase.description}`,
            amount: amount,
            date: new Date().toISOString(),
            type: 'Compra Fornecedor',
            paymentMethod: paymentMethod,
            purchaseId: purchase.id,
            supplierId: purchase.supplierId,
        };
        const { data: newExpense, error } = await supabase.from('expenses').insert({ ...expenseData, company_id: company.id }).select().single();
        if (error) {
            showApiError("Erro ao registar pagamento da compra", error);
            return;
        }
        if (newExpense) {
            setExpenses((prev: Expense[]) => [...prev, newExpense]);
        }
        closeModal();
    }, [company, purchases]);
    
    const handleSaveSalaryAdvance = useCallback(async (data: Pick<SalaryAdvance, 'employeeId' | 'amount' | 'date'>) => {
        if (!company) return;
        const { data: savedAdvance, error } = await supabase.from('salary_advances').insert({ ...data, company_id: company.id }).select().single();
        if (error) {
            showApiError("Erro ao guardar adiantamento", error);
            return;
        }
        if (savedAdvance) setSalaryAdvances((prev: SalaryAdvance[]) => [...prev, savedAdvance]);
        closeModal();
    }, [company]);
    
    const handleSaveOccurrence = useCallback(async (data: { person: string, description: string }) => {
        if (!company) return;
        const { data: savedOccurrence, error } = await supabase.from('occurrences').insert({ ...data, company_id: company.id }).select().single();
        if (error) {
            showApiError("Erro ao guardar ocorrência", error);
            return;
        }
        if (savedOccurrence) setOccurrences((prev: Occurrence[]) => [...prev, savedOccurrence]);
    }, [company]);

    const hasPermission = useCallback((p: Permission): boolean => {
        if (!profile || !roles.length) return false;
        if (profile.role_id === 'admin') return true; // Legacy or super admin
        const role = roles.find((r: Role) => r.id === profile.role_id);
        return (role?.permissions as Permission[])?.includes(p) ?? false;
    }, [profile, roles]);

    const dashboardStats = useMemo(() => {
        const totalRecebido = invoices.flatMap((inv: Invoice) => inv.payments || []).reduce((sum: number, p: InvoicePayment) => sum + p.amount, 0);
        const grossProfit = invoices.flatMap((inv: Invoice) => inv.items).reduce((sum: number, item: InvoiceItem) => {
            const cost = item.purchasePrice || (item.type === 'part' ? (parts.find((p: Part) => p.id === item.itemId)?.purchasePrice || 0) : 0);
            return sum + (item.unitPrice * item.quantity) - (cost * item.quantity);
        }, 0);
        return {
            'Clientes Registados': clients.length,
            'Viaturas Registadas': vehicles.length,
            'Total Recebido': totalRecebido,
            'Lucro Bruto': grossProfit,
        };
    }, [invoices, clients.length, vehicles.length, parts]);

    const followUpItems = useMemo(() => {
        const today = new Date().getTime();
        const warranty: any[] = [];
        const maintenance: any[] = [];
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const oneTwentyDays = 120 * 24 * 60 * 60 * 1000;

        invoices.filter((inv: Invoice) => !inv.follow_up_completed_at).forEach((inv: Invoice) => {
            const issueDate = new Date(inv.issueDate).getTime();
            const daysSince = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24));
            if (today - issueDate > sevenDays && today - issueDate < (sevenDays + 30*24*60*60*1000)) { // window of 30 days
                warranty.push({ invoice: inv, days: daysSince });
            }
            if (today - issueDate > oneTwentyDays && today - issueDate < (oneTwentyDays + 30*24*60*60*1000)) { // window of 30 days
                maintenance.push({ invoice: inv, days: daysSince });
            }
        });
        return { warranty, maintenance };
    }, [invoices]);

    const handleFollowUpComplete = useCallback(async (invoiceId: string) => {
        const { error } = await supabase.from('invoices').update({ follow_up_completed_at: new Date().toISOString() }).eq('id', invoiceId);
        if (error) {
            showApiError("Erro ao marcar follow-up", error);
            return;
        }
        setInvoices((prev: Invoice[]) => prev.map((inv: Invoice) => inv.id === invoiceId ? { ...inv, follow_up_completed_at: new Date().toISOString() } : inv));
    }, []);

    const handleQuickSaleUpdate = (field: keyof Invoice, value: any) => {
        setQuickSaleDraft((prev: Invoice) => ({...prev, [field]: value }));
    };

    const handleQuickSaleAddItem = (item: InvoiceItem) => {
        setQuickSaleDraft((prev: Invoice) => ({...prev, items: [...prev.items, item]}));
    };
    
    const handleQuickSaleRemoveItem = (id: string) => {
        setQuickSaleDraft((prev: Invoice) => ({...prev, items: prev.items.filter((item: InvoiceItem) => item.id !== id)}));
    };
    
    const handleFinalizeQuickSale = () => {
        if (!quickSaleDraft.clientId) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        if (quickSaleDraft.items.length === 0) {
            alert("Por favor, adicione pelo menos um item.");
            return;
        }
        const client = clients.find((c: Client) => c.id === quickSaleDraft.clientId);
        if (client) {
            const finalDraft = {...quickSaleDraft, clientName: `${client.firstName} ${client.lastName}`.trim()};
            openModal("Nova Fatura", renderInvoiceForm(finalDraft), '5xl');
        }
    };
    

    const handleSavePaymentMethod = (data: { originalName: string | null, newName: string, newBalance: number }): {success: boolean, message?: string} => {
        if (!data.newName.trim()) return { success: false, message: "O nome não pode ser vazio."};
        if (data.originalName !== data.newName && paymentMethods.find((p: PaymentMethod) => p.name.toLowerCase() === data.newName.toLowerCase())) {
            return { success: false, message: `O método de pagamento "${data.newName}" já existe.`};
        }
        let newMethods: PaymentMethod[];
        if (data.originalName) { // Editing
            newMethods = paymentMethods.map((p: PaymentMethod) => p.name === data.originalName ? { name: data.newName, initialBalance: data.newBalance } : p);
        } else { // Adding
            newMethods = [...paymentMethods, { name: data.newName, initialBalance: data.newBalance }];
        }
        handleSaveSettings({ payment_methods: newMethods });
        return { success: true };
    };
    
    const handleDeletePaymentMethod = (name: string): {success: boolean, message?: string} => {
        if (['M-Pesa', 'E-mola', 'Numerário'].includes(name)) {
            return { success: false, message: `O método de pagamento "${name}" é essencial e não pode ser removido.`};
        }
        const newMethods = paymentMethods.filter((p: PaymentMethod) => p.name !== name);
        handleSaveSettings({ payment_methods: newMethods });
        return { success: true };
    };

    const handleExportData = () => {
        const data = {
            clients, vehicles, services, parts, assets, assetCategories, assetLocations,
            invoices, expenses, users, roles, suppliers, purchases, employees,
            salaryAdvances, occurrences, extraReceipts,
            settings: {
                layoutSettings,
                paymentMethods,
                logoUrl,
            }
        };
        downloadJson(data, `backup-fast-managment-${new Date().toISOString().split('T')[0]}.json`);
    };

    const handleImportData = async (file: File) => {
        if (!window.confirm("Atenção: A importação irá substituir TODOS os dados atuais pelos dados do ficheiro de backup. Esta ação é irreversível. Deseja continuar?")) {
            return;
        }
        setIsImporting(true);
        setImportStatus('A ler o ficheiro...');
        try {
            const text = await readFileAsText(file);
            const data = JSON.parse(text);
            if (!company) throw new Error("Empresa não encontrada");
            
            // Define all tables to be cleared and imported
            const tables: (keyof Database['public']['Tables'])[] = [
                'clients', 'vehicles', 'services', 'parts', 'assets', 'asset_categories', 'asset_locations', 
                'invoices', 'invoice_items', 'invoice_payments', 'expenses', 'profiles', 'roles', 
                'suppliers', 'purchases', 'employees', 'salary_advances', 'occurrences', 'extra_receipts'
            ];

            // Clear existing data for the company
            for (const table of tables) {
                setImportStatus(`A limpar tabela: ${table}...`);
                const { error } = await supabase.from(table).delete().eq('company_id', company.id);
                // Profiles table needs special handling since you can't delete your own user's profile
                if (error && table !== 'profiles') throw new Error(`Erro ao limpar ${table}: ${error.message}`);
            }

            // Insert new data, adding company_id
            const addCompanyId = (arr: any[]) => arr.map(item => ({ ...item, company_id: company.id }));

            setImportStatus('A importar clientes e viaturas...');
            await supabase.from('clients').insert(addCompanyId(data.clients || []));
            await supabase.from('vehicles').insert(addCompanyId(data.vehicles || []));

            setImportStatus('A importar inventário...');
            await supabase.from('services').insert(addCompanyId(data.services || []));
            await supabase.from('parts').insert(addCompanyId(data.parts || []));
            await supabase.from('assets').insert(addCompanyId(data.assets || []));
            await supabase.from('asset_categories').insert(addCompanyId(data.assetCategories || []));
            await supabase.from('asset_locations').insert(addCompanyId(data.assetLocations || []));

            setImportStatus('A importar entidades...');
            await supabase.from('suppliers').insert(addCompanyId(data.suppliers || []));
            await supabase.from('employees').insert(addCompanyId(data.employees || []));

            setImportStatus('A importar utilizadores e perfis...');
            const adminUser = session?.user;
            await supabase.from('roles').insert(addCompanyId(data.roles || []));
            // Sanitize nullable optional fields to satisfy TS types and PostgREST typings
            const usersWithCompany = addCompanyId(data.users || []).map((u: ProfileRow) => {
                const adjustedRoleId = (u.id === adminUser?.id)
                    ? (data.roles.find((r: Role) => r.name === 'Administrador')?.id || u.role_id)
                    : u.role_id;
                const { is_super_admin, preferred_currency, preferred_language, ...rest } = u as any;
                return {
                    ...rest,
                    role_id: adjustedRoleId,
                    // Convert possible nulls to undefined by conditionally including keys
                    ...(is_super_admin === null ? {} : { is_super_admin }),
                    ...(preferred_currency == null ? {} : { preferred_currency }),
                    ...(preferred_language == null ? {} : { preferred_language }),
                } as ProfileRow;
            });
            await supabase.from('profiles').upsert(usersWithCompany as any);

            setImportStatus('A importar dados financeiros...');
            await supabase.from('expenses').insert(addCompanyId(data.expenses || []));
            await supabase.from('purchases').insert(addCompanyId(data.purchases || []));
            await supabase.from('salary_advances').insert(addCompanyId(data.salaryAdvances || []));
            await supabase.from('extra_receipts').insert(addCompanyId(data.extraReceipts || []));
            await supabase.from('occurrences').insert(addCompanyId(data.occurrences || []));

            setImportStatus('A importar faturas...');
            const invoicesToInsert = addCompanyId((data.invoices || []).map((inv: any) => { const { items, payments, ...rest } = inv; return rest; }));
            await supabase.from('invoices').insert(invoicesToInsert);
            const allItems = (data.invoices || []).flatMap((inv: any) => inv.items ? addCompanyId(inv.items) : []);
            const allPayments = (data.invoices || []).flatMap((inv: any) => inv.payments ? addCompanyId(inv.payments) : []);
            await supabase.from('invoice_items').insert(allItems);
            await supabase.from('invoice_payments').insert(allPayments);

            setImportStatus('A importar definições...');
            if(data.settings) {
                await handleSaveSettings({
                    layout_settings: data.settings.layoutSettings,
                    payment_methods: data.settings.paymentMethods,
                    logo_url: data.settings.logoUrl,
                });
            }

            setImportStatus('Importação concluída! A recarregar a aplicação...');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            showApiError("Erro durante a importação", error.message);
            setIsImporting(false);
            setImportStatus('');
        }
    };
    
    const handleResetDatabase = async () => {
        if (window.prompt("Esta ação é irreversível e irá apagar todos os dados da sua empresa. Escreva 'APAGAR' para confirmar.") !== 'APAGAR') {
            return;
        }
        
        setIsImporting(true); // Reuse loading state
        setImportStatus('A apagar todos os dados...');

        try {
            if (!company) throw new Error("Empresa não encontrada");

            // Define all tables to be cleared
            const tables: (keyof Database['public']['Tables'])[] = [
                'invoice_items', 'invoice_payments', 'invoices', 'expenses', 'purchases', 'salary_advances',
                'parts', 'services', 'assets', 'asset_categories', 'asset_locations',
                'vehicles', 'clients', 'suppliers', 'employees', 'occurrences', 'extra_receipts'
            ];

            for (const table of tables) {
                setImportStatus(`A apagar: ${table}...`);
                const { error } = await supabase.from(table).delete().eq('company_id', company.id);
                if (error) throw new Error(`Erro ao apagar ${table}: ${error.message}`);
            }

            // Reset settings
            setImportStatus('A reiniciar definições...');
            await handleSaveSettings({
                layout_settings: initialLayoutSettings,
                payment_methods: initialPaymentMethods,
                logo_url: null,
            });

            setImportStatus('Dados reiniciados! A recarregar...');
            setTimeout(() => window.location.reload(), 2000);

        } catch(error: any) {
            showApiError("Erro ao reiniciar a base de dados", error.message);
            setIsImporting(false);
            setImportStatus('');
        }
    };

    // FIX: Extracted InvoiceForm rendering into a helper function to avoid "Type instantiation is excessively deep" error.
    const renderInvoiceForm = (invoice: Partial<Invoice>) => (
        <InvoiceForm
            initialInvoice={invoice}
            onSave={handleSaveInvoice}
            onCancel={closeModal}
            clients={clients}
            vehicles={vehicles}
            services={services}
            parts={parts}
            activeUser={profile as User}
            layoutSettings={layoutSettings}
            suppliers={suppliers}
            paymentMethods={paymentMethods}
            purchases={purchases}
            onSavePurchase={(data: { supplierId: string, description: string, amount: number, date: string, purchaseType: 'credit' | 'debit', paymentMethod: string }) => handleSavePurchase(data, true)}  // CORREÇÃO AQUI
        />
    );

// FIX: Extracted InvoiceViewClean rendering into a helper function to avoid "Type instantiation is excessively deep" error.
const renderInvoiceViewCleanModal = (invoice: Invoice, isCollection: boolean) => (
    <InvoiceViewClean
        invoice={invoice}
        client={clients.find((c: Client) => c.id === invoice.clientId)}  // CORREÇÃO AQUI
        vehicle={vehicles.find((v: Vehicle) => v.id === invoice.vehicleId)}  // CORREÇÃO AQUI
        layoutSettings={layoutSettings}
        logoUrl={logoUrl}
        isCollectionInvoice={isCollection}
        onClose={closeModal}
    />
);

// FIX: Extracted EditPaymentForm rendering into a helper function to avoid "Type instantiation is excessively deep" error.
    const renderEditPaymentForm = (payment: InvoicePayment) => (
        <EditPaymentForm
            payment={payment}
            onSave={handleEditPayment}
            onCancel={closeModal}
            paymentMethods={paymentMethods}
        />
    );

// FIX: Extracted PaymentForm rendering into a helper function to avoid "Type instantiation is excessively deep" error.
    const renderPaymentForm = (invoice: Invoice) => (
        <PaymentForm 
            invoice={invoice} 
            onSave={handleSavePayment} 
            onCancel={closeModal} 
            paymentMethods={paymentMethods} 
        />
    );

    const handleOpenRegisterPaymentModal = (invoiceId: string) => {
        const inv = invoices.find((i: Invoice) => i.id === invoiceId);  // CORREÇÃO AQUI
        if(inv) openModal("Registar Pagamento", renderPaymentForm(inv));
    };
    
    const handleOpenViewInvoiceModal = (invoiceId: string, isCollection: boolean) => {
        const inv = invoices.find((i: Invoice) => i.id === invoiceId);  // CORREÇÃO AQUI
        if(inv) openModal("Visualizar Factura", renderInvoiceViewCleanModal(inv, isCollection), '5xl');
    };

    // FIX: Extracted Dashboard rendering into a helper function to avoid "Type instantiation is excessively deep" error.
    const renderDashboard = () => (
        <Dashboard
            stats={dashboardStats}
            quickSaleDraft={quickSaleDraft}
            onQuickSaleUpdate={handleQuickSaleUpdate}
            onQuickSaleAddItem={handleQuickSaleAddItem}
            onQuickSaleRemoveItem={handleQuickSaleRemoveItem}
            onClearQuickSale={() => setQuickSaleDraft(createNewInvoiceDraft(company?.id || ''))}
            onFinalizeQuickSale={handleFinalizeQuickSale}
            onAddCustomItem={() => openModal("Adicionar Item Personalizado", <CustomItemForm onSave={(data: { type: string; description: string; unitPrice: number }) => {
                const newItem: InvoiceItem = {
                    id: `item-${Date.now()}`,
                    company_id: company!.id,
                    invoice_id: quickSaleDraft.id,
                    itemId: `custom-${Date.now()}`,
                    type: data.type as "part" | "service" | "custom", // CORREÇÃO AQUI
                    description: data.description,
                    quantity: 1,
                    unitPrice: data.unitPrice,
                    purchasePrice: null,
                    supplierId: null,
                    isCustom: true,
                    created_at: new Date().toISOString(),
                };
                handleQuickSaleAddItem(newItem);
                closeModal();
            }} onCancel={closeModal} />)}
            onAddClient={clientHandlers.onAdd}
            clients={clients}
            services={services}
            parts={parts}
            followUpItems={followUpItems}
            onMarkFollowUpComplete={handleFollowUpComplete}
            hasPermission={hasPermission}
            activeUser={profile as User}
        />
    );


    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'ai_diagnostics': return <AIDiagnosticsPage 
                services={services}
                parts={parts}
            />;
            case 'invoices': return <InvoicingPage 
                invoices={invoices}
                expenses={expenses}
                onNewInvoice={() => openModal("Nova Fatura", renderInvoiceForm({}), '5xl')}
                onEditInvoice={(id: string) => {
                    const invoice = invoices.find((inv: Invoice) => inv.id === id);
                    if (invoice) openModal("Editar Fatura", renderInvoiceForm(invoice), '5xl');
                }}
                onViewInvoice={handleOpenViewInvoiceModal}
                onDeleteInvoice={handleDeleteInvoice}
                onNewExpense={expenseHandlers.onAdd}
                onRegisterPayment={handleOpenRegisterPaymentModal}
                hasPermission={hasPermission}
            />;
            case 'clients': return <ClientsPage 
                clients={clients}
                vehicles={vehicles}
                onAdd={clientHandlers.onAdd}
                onEdit={clientHandlers.onEdit}
                onDelete={clientHandlers.onDelete}
                onViewFinancials={setViewingClientFinancials}
                hasPermission={hasPermission}
            />;
            case 'vehicles': return <VehiclesPage 
                vehicles={vehicles}
                clients={clients}
                onAdd={vehicleHandlers.onAdd}
                onEdit={vehicleHandlers.onEdit}
                onDelete={vehicleHandlers.onDelete}
                hasPermission={hasPermission}
            />;
            case 'services': return <ServicesPage 
                services={services}
                onAdd={serviceHandlers.onAdd}
                onEdit={serviceHandlers.onEdit}
                onDelete={serviceHandlers.onDelete}
                hasPermission={hasPermission}
            />;
            case 'parts': return <PartsPage 
                parts={parts}
                suppliers={suppliers}
                onAdd={partHandlers.onAdd}
                onEdit={partHandlers.onEdit}
                onDelete={partHandlers.onDelete}
                hasPermission={hasPermission}
            />;
            case 'employees': return <EmployeesPage 
                employees={employees}
                salaryAdvances={salaryAdvances}
                onAdd={employeeHandlers.onAdd}
                onEdit={employeeHandlers.onEdit}
                onDelete={employeeHandlers.onDelete}
                onAddSalaryAdvance={(employeeId: string) => openModal("Novo Adiantamento", <SalaryAdvanceForm employeeId={employeeId} employees={employees} onSave={handleSaveSalaryAdvance} onCancel={closeModal} />)}
                hasPermission={hasPermission}
            />;
            case 'expenses': return <ExpensesPage 
                expenses={expenses}
                paymentMethods={paymentMethods}
                onAdd={expenseHandlers.onAdd}
                onEdit={expenseHandlers.onEdit}
                onDelete={expenseHandlers.onDelete}
                hasPermission={hasPermission}
            />;
            case 'settings': return <SettingsPage 
                layoutSettings={layoutSettings}
                paymentMethods={paymentMethods}
                logoUrl={logoUrl}
                onSaveLayoutSettings={handleSaveLayoutSettings}
                onSavePaymentMethod={handleSavePaymentMethod}
                onDeletePaymentMethod={handleDeletePaymentMethod}
                onLogoUpload={handleLogoUpload}
                onLogoRemove={handleLogoRemove}
                onExport={handleExportData}
                onImport={handleImportData}
                onReset={handleResetDatabase}
                company={company}
                license={license}
                onActivationSuccess={handleLicenseActivation}
                users={users}
                roles={roles}
                onAddUser={handleAddUser}
                hasPermission={hasPermission}
            />;
            case 'permissions': return <PermissionsPage 
                roles={roles}
                onAdd={roleHandlers.onAdd}
                onEdit={roleHandlers.onEdit}
                onDelete={roleHandlers.onDelete}
                hasPermission={hasPermission}
            />;
            case 'suppliers': return <SuppliersPage 
                suppliers={suppliers} 
                purchases={purchases} 
                expenses={expenses} 
                onAdd={supplierHandlers.onAdd} 
                onEdit={supplierHandlers.onEdit} 
                onDelete={supplierHandlers.onDelete} 
                // CORREÇÃO: Adicionar tipos para os parâmetros
                onAddPurchase={(id: string) => openModal("Nova Compra", <SupplierPurchaseForm preselectedSupplierId={id} suppliers={suppliers} paymentMethods={paymentMethods} onSave={handleSavePurchase} onCancel={closeModal} />)} 
                onPayPurchase={(purchase: Purchase, balance: number) => openModal("Pagar Compra", <PurchasePaymentForm purchase={purchase} balance={balance} supplierName={suppliers.find((s: Supplier) => s.id === purchase.supplierId)?.name || ''} paymentMethods={paymentMethods} onSave={handlePayPurchase} onCancel={closeModal}/>)} 
                hasPermission={hasPermission} 
            />;
            case 'statement': return <StatementPage invoices={invoices} clients={clients} suppliers={suppliers} expenses={expenses} />;
            case 'client_credit': return <ClientCreditPage clients={clients} invoices={invoices} onPayInvoice={handleOpenRegisterPaymentModal} onViewInvoice={handleOpenViewInvoiceModal} />;
            case 'loyal_clients': return <LoyalClientsPage clients={clients} invoices={invoices} />;
            case 'occurrences': return <OccurrencesPage occurrences={occurrences} onSave={handleSaveOccurrence} />;
            case 'reports': return <ReportsPage invoices={invoices} expenses={expenses} clients={clients} occurrences={occurrences} purchases={purchases} salaryAdvances={salaryAdvances} extraReceipts={extraReceipts} employees={employees} suppliers={suppliers} />;
// FIX: Explicitly typed the `payment` parameter to avoid a "Type instantiation is excessively deep" error.
            case 'recebidos': return <RecebimentosPage invoices={invoices} extraReceipts={extraReceipts} expenses={expenses} paymentMethods={paymentMethods} onAddExtraReceipt={extraReceiptHandlers.handleSave} onEditExtraReceipt={extraReceiptHandlers.handleSave} onDeleteExtraReceipt={extraReceiptHandlers.onDelete} onViewInvoice={handleOpenViewInvoiceModal} onDeleteInvoicePayment={handleDeleteInvoicePayment} onOpenEditPaymentModal={(payment: InvoicePayment) => openModal("Editar Pagamento", renderEditPaymentForm(payment))} />;
            case 'assets': return <PatrimonioPage assets={assets} categories={assetCategories} locations={assetLocations} suppliers={suppliers} onAdd={assetHandlers.onAdd} onEdit={assetHandlers.onEdit} onDelete={assetHandlers.onDelete} hasPermission={hasPermission} setActivePage={setActivePage} />;
            case 'asset_categories': return <AssetCategoriesPage categories={assetCategories} onAdd={assetCategoryHandlers.onAdd} onEdit={assetCategoryHandlers.onEdit} onDelete={assetCategoryHandlers.onDelete} hasPermission={hasPermission} setActivePage={setActivePage} />;
            case 'asset_locations': return <AssetLocationsPage locations={assetLocations} onAdd={assetLocationHandlers.onAdd} onEdit={assetLocationHandlers.onEdit} onDelete={assetLocationHandlers.onDelete} hasPermission={hasPermission} setActivePage={setActivePage} />;
            default: return <Dashboard stats={dashboardStats} quickSaleDraft={quickSaleDraft} onQuickSaleUpdate={handleQuickSaleUpdate} onQuickSaleAddItem={handleQuickSaleAddItem} onQuickSaleRemoveItem={handleQuickSaleRemoveItem} onClearQuickSale={() => setQuickSaleDraft(createNewInvoiceDraft(company?.id || ''))} onFinalizeQuickSale={handleFinalizeQuickSale} onAddCustomItem={() => {}} onAddClient={() => {}} clients={clients} services={services} parts={parts} followUpItems={followUpItems} onMarkFollowUpComplete={handleFollowUpComplete} hasPermission={hasPermission} activeUser={profile as User} />;
        }
    };

    if (viewMode === 'loading') {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}></div></div>;
    }
    if (isImporting) {
        return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}></div><p style={{ marginTop: '1rem', color: 'var(--color-text-primary)' }}>{importStatus}</p></div>;
    }
    if (viewMode === 'landing') return <LandingPage onSetViewMode={setViewMode} />;
    if (viewMode === 'login') return <LoginPage onGoToLanding={() => setViewMode('landing')} onGoToRegistration={() => setViewMode('registration')} onGoToPasswordReset={() => setViewMode('passwordResetRequest')} />;
    if (viewMode === 'registration') return <RegistrationPage onGoToLanding={() => setViewMode('landing')} />;
    if (viewMode === 'passwordResetRequest') return <PasswordResetRequestPage onGoToLogin={() => setViewMode('login')} />;
    if (viewMode === 'updatePassword') return <UpdatePasswordPage onSuccess={() => setViewMode('login')} />;
    if (viewMode === 'completeRegistration' && session) return <CompleteRegistrationPage session={session} onSuccess={() => loadInitialData(session)} />;
    if (viewMode === 'expired') return <ExpiredPage company={company} onActivationSuccess={handleLicenseActivation} />;
    if (viewMode === 'superAdmin' && adminData) return <SuperAdminPage data={adminData} onLogout={handleLogout} />;
    
    if (viewMode !== 'app' || !session || !profile || !company) {
        return <LoginPage onGoToLanding={() => setViewMode('landing')} onGoToRegistration={() => setViewMode('registration')} onGoToPasswordReset={() => setViewMode('passwordResetRequest')} />;
    }

    return (
        <div className="app-layout">
             {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>Fast Managment</h1>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{company.name}</p>
                </div>
                <nav style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {NAV_ITEMS.map(item => {
  const isActive = activePage === item.id;
  return (
    <a 
      key={item.id} 
      href="#" 
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { 
        e.preventDefault(); 
        setActivePage(item.id); 
        setSidebarOpen(false); 
      }} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.75rem 1rem', 
        margin: '0.25rem 0',
        fontSize: '0.875rem',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s ease-in-out',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#fff' : 'var(--color-text-secondary)',
        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isActive ? '0 4px 14px 0 hsla(347, 97%, 63%, 0.3)' : 'none'
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { 
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'hsla(213, 100%, 85%, 0.1)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { 
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }
      }}
    >
      {item.icon}
      <span>{getNavLabel(item.id)}</span>
    </a>
  );
})}

                </nav>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
                        {ICONS.LOGOUT} <span>{t('common.logout')}</span>
                    </button>
                    <div style={{ 
                        marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.5rem', borderRadius: 'var(--radius-md)',
                        backgroundColor: isOnline ? 'hsla(139, 60%, 55%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)',
                        color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        {isOnline ? ICONS.CLOUD_ONLINE : isSyncing ? ICONS.CLOUD_UPLOADING : ICONS.CLOUD_OFF}
                        <span>{isOnline ? (isSyncing ? `Sincronizando... (${pendingSyncCount})` : 'Online') : `Offline (${pendingSyncCount} pendente)`}</span>
                    </div>
                </div>
            </aside>
            {/* Main content */}
            <div className="main-content">
                <header className="mobile-header">
                     <h1>{getNavLabel(activePage)}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="btn-icon" style={{ color: 'var(--color-text-primary)'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                    </div>
                </header>
                <main className="main-content-area">
                    {renderPage()}
                </main>
            </div>

            {isModalOpen && <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} size={modalSize}>{modalContent}</Modal>}
            
            
            {viewingClientFinancials && (
                <ClientFinancialDashboardPage
                    client={viewingClientFinancials}
                    allInvoices={invoices}
                    paymentMethods={paymentMethods}
                    onClose={() => setViewingClientFinancials(null)}
                    onRegisterPayment={handleOpenRegisterPaymentModal}
                    onViewInvoice={handleOpenViewInvoiceModal}
                />
            )}
        </div>
    );
};

export default App;