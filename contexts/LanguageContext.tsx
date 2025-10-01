import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Set document direction for Arabic
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string, params?: Record<string, string>) => {
    const translations = getTranslations(language);
    let translation = getNestedValue(translations, key) || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const getNestedValue = (obj: any, key: string): string => {
  return key.split('.').reduce((o, k) => o?.[k], obj);
};

const getTranslations = (lang: Language) => {
  switch (lang) {
    case 'pt':
      return ptTranslations;
    case 'en':
      return enTranslations;
    case 'es':
      return esTranslations;
    case 'ar':
      return arTranslations;
    default:
      return ptTranslations;
  }
};

const ptTranslations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Adicionar',
    search: 'Pesquisar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    yes: 'Sim',
    no: 'Não',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    confirm: 'Confirmar',
    required: 'Obrigatório',
    optional: 'Opcional',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Desconto',
    tax: 'Imposto',
    date: 'Data',
    description: 'Descrição',
    amount: 'Valor',
    price: 'Preço',
    quantity: 'Quantidade',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    address: 'Endereço',
    logout: 'Terminar Sessão'
  },
  nav: {
    dashboard: 'Painel',
    invoices: 'Faturas',
    clients: 'Clientes',
    vehicles: 'Viaturas',
    services: 'Serviços',
    parts: 'Peças',
    suppliers: 'Fornecedores',
    employees: 'Funcionários',
    reports: 'Relatórios',
    receivables: 'Recebimentos',
    settings: 'Definições'
  },
  dashboard: {
    title: 'Painel',
    quickSale: 'Venda Rápida',
    followUp: 'Ações de Pós-Venda',
    warranty: 'Garantia (7 dias)',
    maintenance: 'Manutenção (120 dias)',
    selectClient: 'Selecione um Cliente',
    addService: 'Adicionar Serviço',
    addPart: 'Adicionar Peça',
    subtotal: 'Subtotal',
    clear: 'Limpar',
    createInvoice: 'Criar Fatura',
    contacted: 'Contactado',
    pendingForDays: 'Pendente há {{days}} dias',
    addClient: 'Adicionar Cliente',
    customItem: 'Item Personalizado',
    noItemsAdded: 'Nenhum item adicionado.',
    noPendingActions: 'Nenhuma ação pendente.',
    stats: {
      clients: 'Clientes Registados',
      vehicles: 'Viaturas Registadas',
      totalReceived: 'Total Recebido',
      grossProfit: 'Lucro Bruto'
    }
  },
  invoice: {
    title: 'Fatura',
    newInvoice: 'Nova Fatura',
    client: 'Cliente',
    vehicle: 'Viatura',
    items: 'Itens',
    payment: 'Pagamento',
    status: 'Estado',
    issueDate: 'Data de Emissão',
    dueDate: 'Data de Vencimento',
    addItem: 'Adicionar Item',
    removeItem: 'Remover Item',
    customItem: 'Item Personalizado',
    service: 'Prestação de Serviço',
    part: 'Fornecimento de Acessório',
    finalize: 'Finalizar Fatura'
  },
  client: {
    title: 'Cliente',
    newClient: 'Novo Cliente',
    clientName: 'Nome do Cliente',
    clientPhone: 'Telefone',
    clientEmail: 'Email',
    clientAddress: 'Endereço'
  }
};

const enTranslations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    required: 'Required',
    optional: 'Optional',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    date: 'Date',
    description: 'Description',
    amount: 'Amount',
    price: 'Price',
    quantity: 'Quantity',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    logout: 'Logout'
  },
  nav: {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    clients: 'Clients',
    vehicles: 'Vehicles',
    services: 'Services',
    parts: 'Parts',
    suppliers: 'Suppliers',
    employees: 'Employees',
    reports: 'Reports',
    receivables: 'Receivables',
    settings: 'Settings'
  },
  dashboard: {
    title: 'Dashboard',
    quickSale: 'Quick Sale',
    followUp: 'Follow-up Actions',
    warranty: 'Warranty (7 days)',
    maintenance: 'Maintenance (120 days)',
    selectClient: 'Select a Client',
    addService: 'Add Service',
    addPart: 'Add Part',
    subtotal: 'Subtotal',
    clear: 'Clear',
    createInvoice: 'Create Invoice',
    contacted: 'Contacted',
    pendingForDays: 'Pending for {{days}} days',
    addClient: 'Add Client',
    customItem: 'Custom Item',
    noItemsAdded: 'No items added.',
    noPendingActions: 'No pending actions.',
    stats: {
      clients: 'Registered Clients',
      vehicles: 'Registered Vehicles',
      totalReceived: 'Total Received',
      grossProfit: 'Gross Profit'
    }
  },
  invoice: {
    title: 'Invoice',
    newInvoice: 'New Invoice',
    client: 'Client',
    vehicle: 'Vehicle',
    items: 'Items',
    payment: 'Payment',
    status: 'Status',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    addItem: 'Add Item',
    removeItem: 'Remove Item',
    customItem: 'Custom Item',
    service: 'Service Provision',
    part: 'Parts Supply',
    finalize: 'Finalize Invoice'
  },
  client: {
    title: 'Client',
    newClient: 'New Client',
    clientName: 'Client Name',
    clientPhone: 'Phone',
    clientEmail: 'Email',
    clientAddress: 'Address'
  }
};

const esTranslations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Añadir',
    search: 'Buscar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    yes: 'Sí',
    no: 'No',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    confirm: 'Confirmar',
    required: 'Requerido',
    optional: 'Opcional',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    tax: 'Impuesto',
    date: 'Fecha',
    description: 'Descripción',
    amount: 'Cantidad',
    price: 'Precio',
    quantity: 'Cantidad',
    name: 'Nombre',
    email: 'Email',
    phone: 'Teléfono',
    address: 'Dirección',
    logout: 'Cerrar Sesión'
  },
  nav: {
    dashboard: 'Panel',
    invoices: 'Facturas',
    clients: 'Clientes',
    vehicles: 'Vehículos',
    services: 'Servicios',
    parts: 'Piezas',
    suppliers: 'Proveedores',
    employees: 'Empleados',
    reports: 'Informes',
    receivables: 'Cobros',
    settings: 'Configuración'
  },
  dashboard: {
    title: 'Panel',
    quickSale: 'Venta Rápida',
    followUp: 'Acciones de Seguimiento',
    warranty: 'Garantía (7 días)',
    maintenance: 'Mantenimiento (120 días)',
    selectClient: 'Seleccionar Cliente',
    addService: 'Añadir Servicio',
    addPart: 'Añadir Pieza',
    subtotal: 'Subtotal',
    clear: 'Limpiar',
    createInvoice: 'Crear Factura',
    contacted: 'Contactado',
    pendingForDays: 'Pendiente desde hace {{days}} días',
    addClient: 'Añadir Cliente',
    customItem: 'Artículo Personalizado',
    noItemsAdded: 'Ningún artículo añadido.',
    noPendingActions: 'No hay acciones pendientes.',
    stats: {
      clients: 'Clientes Registrados',
      vehicles: 'Vehículos Registrados',
      totalReceived: 'Total Recibido',
      grossProfit: 'Beneficio Bruto'
    }
  },
  invoice: {
    title: 'Factura',
    newInvoice: 'Nueva Factura',
    client: 'Cliente',
    vehicle: 'Vehículo',
    items: 'Artículos',
    payment: 'Pago',
    status: 'Estado',
    issueDate: 'Fecha de Emisión',
    dueDate: 'Fecha de Vencimiento',
    addItem: 'Añadir Artículo',
    removeItem: 'Eliminar Artículo',
    customItem: 'Artículo Personalizado',
    service: 'Prestación de Servicio',
    part: 'Suministro de Accesorios',
    finalize: 'Finalizar Factura'
  },
  client: {
    title: 'Cliente',
    newClient: 'Nuevo Cliente',
    clientName: 'Nombre del Cliente',
    clientPhone: 'Teléfono',
    clientEmail: 'Email',
    clientAddress: 'Dirección'
  }
};

const arTranslations = {
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تحرير',
    delete: 'حذف',
    add: 'إضافة',
    search: 'بحث',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    yes: 'نعم',
    no: 'لا',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    confirm: 'تأكيد',
    required: 'مطلوب',
    optional: 'اختياري',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    discount: 'خصم',
    tax: 'ضريبة',
    date: 'التاريخ',
    description: 'الوصف',
    amount: 'المبلغ',
    price: 'السعر',
    quantity: 'الكمية',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    logout: 'تسجيل الخروج'
  },
  nav: {
    dashboard: 'لوحة التحكم',
    invoices: 'الفواتير',
    clients: 'العملاء',
    vehicles: 'المركبات',
    services: 'الخدمات',
    parts: 'قطع الغيار',
    suppliers: 'الموردون',
    employees: 'الموظفون',
    reports: 'التقارير',
    receivables: 'المقبوضات',
    settings: 'الإعدادات'
  },
  dashboard: {
    title: 'لوحة التحكم',
    quickSale: 'بيع سريع',
    followUp: 'إجراءات المتابعة',
    warranty: 'الضمان (7 أيام)',
    maintenance: 'الصيانة (120 يوم)',
    selectClient: 'اختر العميل',
    addService: 'إضافة خدمة',
    addPart: 'إضافة قطعة غيار',
    subtotal: 'المجموع الفرعي',
    clear: 'مسح',
    createInvoice: 'إنشاء فاتورة',
    contacted: 'تم الاتصال',
    pendingForDays: 'معلق منذ {{days}} أيام',
    addClient: 'إضافة عميل',
    customItem: 'عنصر مخصص',
    noItemsAdded: 'لم تتم إضافة عناصر.',
    noPendingActions: 'لا توجد إجراءات معلقة.',
    stats: {
      clients: 'العملاء المسجلون',
      vehicles: 'المركبات المسجلة',
      totalReceived: 'إجمالي المستلم',
      grossProfit: 'الربح الإجمالي'
    }
  },
  invoice: {
    title: 'فاتورة',
    newInvoice: 'فاتورة جديدة',
    client: 'العميل',
    vehicle: 'المركبة',
    items: 'البنود',
    payment: 'الدفع',
    status: 'الحالة',
    issueDate: 'تاريخ الإصدار',
    dueDate: 'تاريخ الاستحقاق',
    addItem: 'إضافة بند',
    removeItem: 'إزالة بند',
    customItem: 'بند مخصص',
    service: 'تقديم خدمة',
    part: 'توريد قطع غيار',
    finalize: 'إنهاء الفاتورة'
  },
  client: {
    title: 'العميل',
    newClient: 'عميل جديد',
    clientName: 'اسم العميل',
    clientPhone: 'الهاتف',
    clientEmail: 'البريد الإلكتروني',
    clientAddress: 'العنوان'
  }
};