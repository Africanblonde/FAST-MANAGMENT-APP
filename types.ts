// This file is based on the auto-generated types from Supabase CLI
// `npx supabase gen types typescript --project-id "your-project-id" > types.ts`
// For this buildless setup, we define them manually.

// FIX: Using the standard recursive definition for Json to properly support Supabase type inference.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const ALL_PERMISSIONS = [
  // Invoices & Quotations
  'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices', 'change_invoice_prices',
  'apply_discounts', 'register_payments', 'print_invoices',
  // Clients & Entities
  'view_clients', 'create_clients', 'edit_clients', 'delete_clients', 'manage_vehicles',
  'manage_suppliers', 'manage_employees', 'manage_assets',
  // Inventory
  'manage_parts', 'manage_services',
  // Financials & Reporting
  'view_dashboard_financials', 'view_reports', 'manage_expenses',
  // Admin
  'manage_settings', 'manage_users', 'manage_roles', 'perform_backup', 'reset_database',
  // AI
  'use_ai_diagnostics',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];


// --- UI TYPES (not directly from DB) ---
// These are defined first as they don't depend on the Database type.

export type LayoutSettings = {
    companyName: string;
    quotationTitle: string;
    invoiceTitle: string;
    collectionInvoiceTitle: string;
    footerNuit: string;
    footerContact: string;
    footerAddress: string;
    footerMessage: string;
    taxEnabled: boolean;
    taxName: string;
    taxRate: number;
    invoicePrefix: string;
    invoiceNextNumber: number;
}
export type PaymentMethod = {
    name: string;
    initialBalance: number;
}

export type DiagnosisResponse = {
  possiveisCausas: string[];
  verificacoesRecomendadas: string[];
  servicosSugeridos: { nome: string; tipo: 'peça' | 'serviço' }[];
}

// --- SUPER ADMIN TYPES ---
export type LicenseStatus = 'Active' | 'Trial' | 'Expired';

export interface AdminCompanyView {
    id: string;
    name: string;
    adminEmail: string;
    createdAt: string;
    licenseStatus: LicenseStatus;
    expiresAt: string | null;
}

export interface AdminDashboardData {
    totalCompanies: number;
    activeLicenses: number;
    expiredOrTrial: number;
    companies: AdminCompanyView[];
}

// --- CENTRAL DATABASE DEFINITION ---
// This is the core type definition that mirrors the Supabase database schema.
// FIX: Changed 'Database' from an 'interface' back to a 'type' to correctly resolve Supabase client types, as 'interface' was causing inference failures.
// FIX: Added Insert and Update types for each table to allow Supabase client to correctly infer types.
export type InvoiceStatus = 'Pendente' | 'Pago Parcialmente' | 'Pago' | 'Atrasado' | 'Anulada';

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string; // uuid
          name: string;
          trial_ends_at: string; // timestamp
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trial_ends_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          trial_ends_at?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      profiles: {
        Row: {
          id: string; // uuid, references auth.users.id
          company_id: string; // uuid
          name: string;
          role_id: string; // uuid
          updated_at: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          is_super_admin: boolean | null;
          preferred_currency: string | null; // MZN, BRL, USD, EUR, ZAR, GBP
          preferred_language: string | null; // pt, en, es, ar
        };
        Insert: {
          id: string;
          company_id: string;
          name: string;
          role_id: string;
          updated_at?: string;
          is_super_admin?: boolean;
          preferred_currency?: string;
          preferred_language?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          role_id?: string;
          updated_at?: string;
          is_super_admin?: boolean;
          preferred_currency?: string;
          preferred_language?: string;
        };
        Relationships: [];
      },
      licenses: {
        Row: {
          id: string; // uuid
          key: string;
          duration_days: number;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          duration_days: number;
          description?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          duration_days?: number;
          description?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      },
      company_licenses: {
        Row: {
          id: string; // uuid
          company_id: string;
          license_id: string;
          activated_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          license_id: string;
          activated_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          license_id?: string;
          activated_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      },
      roles: {
        Row: {
          id: string; // uuid
          company_id: string;
          name: string;
          // FIX: Replaced generic 'Json' type with the specific 'Permission[]' type for better type safety and to resolve inference issues.
          permissions: Permission[]; // jsonb
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          permissions: Permission[];
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          permissions?: Permission[];
          created_at?: string;
        };
        Relationships: [];
      },
      clients: {
        Row: {
          id: string; // uuid
          company_id: string;
          firstName: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          middleName: string | null;
          lastName: string;
          contact: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          firstName: string;
          middleName?: string | null;
          lastName: string;
          contact: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          firstName?: string;
          middleName?: string | null;
          lastName?: string;
          contact?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      vehicles: {
        Row: {
          id: string; // uuid
          company_id: string;
          clientId: string; // uuid
          licensePlate: string;
          model: string;
          type: 'Ligeiro' | 'Pesado';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          clientId: string;
          licensePlate: string;
          model: string;
          type: 'Ligeiro' | 'Pesado';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          clientId?: string;
          licensePlate?: string;
          model?: string;
          type?: 'Ligeiro' | 'Pesado';
          created_at?: string;
        };
        Relationships: [];
      },
      services: {
        Row: {
          id: string; // uuid
          company_id: string;
          name: string;
          price: number;
          type: 'Ligeiro' | 'Pesado' | 'Geral';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          price: number;
          type: 'Ligeiro' | 'Pesado' | 'Geral';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          price?: number;
          type?: 'Ligeiro' | 'Pesado' | 'Geral';
          created_at?: string;
        };
        Relationships: [];
      },
      parts: {
        Row: {
          id: string; // uuid
          company_id: string;
          name: string;
          quantity: number;
          purchasePrice: number;
          salePrice: number;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          brand: string | null;
          partNumber: string | null;
          supplierId: string | null; // uuid
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          quantity: number;
          purchasePrice: number;
          salePrice: number;
          brand?: string | null;
          partNumber?: string | null;
          supplierId?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          quantity?: number;
          purchasePrice?: number;
          salePrice?: number;
          brand?: string | null;
          partNumber?: string | null;
          supplierId?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      suppliers: {
        Row: {
          id: string; // uuid
          company_id: string;
          name: string;
          contact: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          contact: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          contact?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      invoices: {
        Row: {
          id: string; // uuid
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          display_id: string | null;
          company_id: string;
          clientId: string; // uuid
          vehicleId: string; // uuid
          clientName: string;
          vehicleLicensePlate: string;
          subtotal: number;
          taxAmount: number;
          taxApplied: boolean;
          total: number;
          issueDate: string;
          status: InvoiceStatus;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          description: string | null;
          discount: number | null;
          discountType: 'percentage' | 'fixed' | null;
          created_at: string;
          follow_up_completed_at: string | null;
        };
        Insert: {
          id?: string;
          display_id?: string | null;
          company_id: string;
          clientId: string;
          vehicleId: string;
          clientName: string;
          vehicleLicensePlate: string;
          subtotal: number;
          taxAmount: number;
          taxApplied: boolean;
          total: number;
          issueDate: string;
          status: InvoiceStatus;
          description?: string | null;
          discount?: number | null;
          discountType?: 'percentage' | 'fixed' | null;
          created_at?: string;
          follow_up_completed_at?: string | null;
        };
        Update: {
          id?: string;
          display_id?: string | null;
          company_id?: string;
          clientId?: string;
          vehicleId?: string;
          clientName?: string;
          vehicleLicensePlate?: string;
          subtotal?: number;
          taxAmount?: number;
          taxApplied?: boolean;
          total?: number;
          issueDate?: string;
          status?: InvoiceStatus;
          description?: string | null;
          discount?: number | null;
          discountType?: 'percentage' | 'fixed' | null;
          created_at?: string;
          follow_up_completed_at?: string | null;
        };
        Relationships: [];
      },
      invoice_items: {
        Row: {
          id: string; // uuid
          company_id: string;
          invoice_id: string; // uuid
          itemId: string;
          type: 'part' | 'service' | 'custom';
          description: string;
          quantity: number;
          unitPrice: number;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          purchasePrice: number | null;
          supplierId: string | null; // uuid
          isCustom: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          invoice_id: string;
          itemId: string;
          type: 'part' | 'service' | 'custom';
          description: string;
          quantity: number;
          unitPrice: number;
          purchasePrice?: number | null;
          supplierId?: string | null;
          isCustom?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          invoice_id?: string;
          itemId?: string;
          type?: 'part' | 'service' | 'custom';
          description?: string;
          quantity?: number;
          unitPrice?: number;
          purchasePrice?: number | null;
          supplierId?: string | null;
          isCustom?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      },
      invoice_payments: {
        Row: {
          id: string; // uuid
          company_id: string;
          invoice_id: string; // uuid
          amount: number;
          date: string;
          method: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          receiptNumber: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          invoice_id: string;
          amount: number;
          date: string;
          method: string;
          receiptNumber?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          invoice_id?: string;
          amount?: number;
          date?: string;
          method?: string;
          receiptNumber?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      purchases: {
        Row: {
            id: string; // uuid
            company_id: string;
            supplierId: string; // uuid
            description: string;
            amount: number;
            date: string; // date
            created_at: string;
        };
        Insert: {
            id?: string;
            company_id: string;
            supplierId: string;
            description: string;
            amount: number;
            date: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            company_id?: string;
            supplierId?: string;
            description?: string;
            amount?: number;
            date?: string;
            created_at?: string;
        };
        Relationships: [];
      },
      expenses: {
        Row: {
          id: string; // uuid
          company_id: string;
          description: string;
          amount: number;
          date: string;
          type: 'Geral' | 'Compra Fornecedor' | 'Pagamento de Salário';
          paymentMethod: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          purchaseId: string | null; // uuid
          supplierId: string | null; // uuid
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          description: string;
          amount: number;
          date: string;
          type: 'Geral' | 'Compra Fornecedor' | 'Pagamento de Salário';
          paymentMethod: string;
          purchaseId?: string | null;
          supplierId?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          description?: string;
          amount?: number;
          date?: string;
          type?: 'Geral' | 'Compra Fornecedor' | 'Pagamento de Salário';
          paymentMethod?: string;
          purchaseId?: string | null;
          supplierId?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      employees: {
        Row: {
          id: string; // uuid
          company_id: string;
          name: string;
          salary: number;
          role: 'Mecânico' | 'Administração';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          salary: number;
          role: 'Mecânico' | 'Administração';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          salary?: number;
          role?: 'Mecânico' | 'Administração';
          created_at?: string;
        };
        Relationships: [];
      },
      salary_advances: {
        Row: {
            id: string; // uuid
            company_id: string;
            employeeId: string; // uuid
            amount: number;
            date: string;
            created_at: string;
        };
        Insert: {
            id?: string;
            company_id: string;
            employeeId: string;
            amount: number;
            date: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            company_id?: string;
            employeeId?: string;
            amount?: number;
            date?: string;
            created_at?: string;
        };
        Relationships: [];
      },
      occurrences: {
        Row: {
            id: string; // uuid
            company_id: string;
            person: string;
            description: string;
            created_at: string;
        };
        Insert: {
            id?: string;
            company_id: string;
            person: string;
            description: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            company_id?: string;
            person?: string;
            description?: string;
            created_at?: string;
        };
        Relationships: [];
      },
      extra_receipts: {
        Row: {
          id: string; // uuid
          company_id: string;
          description: string;
          amount: number;
          date: string;
          paymentMethod: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          description: string;
          amount: number;
          date: string;
          paymentMethod: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          description?: string;
          amount?: number;
          date?: string;
          paymentMethod?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      assets: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          model: string | null;
          serialNumber: string | null;
          categoryId: string;
          locationId: string;
          supplierId: string | null;
          purchaseDate: string | null;
          purchasePrice: number | null;
          quantity: number;
          status: 'Ativo' | 'Inativo' | 'Em Manutenção';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          model?: string | null;
          serialNumber?: string | null;
          categoryId: string;
          locationId: string;
          supplierId?: string | null;
          purchaseDate?: string | null;
          purchasePrice?: number | null;
          quantity: number;
          status: 'Ativo' | 'Inativo' | 'Em Manutenção';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          model?: string | null;
          serialNumber?: string | null;
          categoryId?: string;
          locationId?: string;
          supplierId?: string | null;
          purchaseDate?: string | null;
          purchasePrice?: number | null;
          quantity?: number;
          status?: 'Ativo' | 'Inativo' | 'Em Manutenção';
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      asset_categories: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      },
      asset_locations: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          // FIX: Changed optional properties to be explicitly nullable for Row types to match Supabase's return values.
          responsible: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          responsible?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          responsible?: string | null;
          created_at?: string;
        };
        Relationships: [];
      },
      settings: {
        Row: {
          company_id: string;
          // FIX: Replaced generic 'Json' type with specific types for better type safety and to resolve inference issues.
          layout_settings: LayoutSettings;
          payment_methods: PaymentMethod[];
          logo_url: string | null;
        };
        Insert: {
          company_id: string;
          layout_settings: LayoutSettings;
          payment_methods: PaymentMethod[];
          logo_url: string | null;
        };
        Update: {
          company_id?: string;
          layout_settings?: LayoutSettings;
          payment_methods?: PaymentMethod[];
          logo_url?: string | null;
        };
        Relationships: [];
      }
    },
    Views: {},
    Functions: {
      handle_new_user_setup: {
        Args: {
          c_name: string;
          u_name: string;
        };
        Returns: string; // uuid
      }
    },
    // FIX: Added empty Enums and CompositeTypes to complete the schema structure for the Supabase client.
    Enums: {},
    CompositeTypes: {}
  }
};


// --- DERIVED SUPABASE & APP DATA TYPES ---
// These types are derived from the central Database type for consistency and maintainability.

export type Company = Database['public']['Tables']['companies']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type License = Database['public']['Tables']['licenses']['Row'];
export type CompanyLicense = Database['public']['Tables']['company_licenses']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type SupplierRow = Database['public']['Tables']['suppliers']['Row'];
export type Part = Database['public']['Tables']['parts']['Row'];
export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type InvoicePayment = Database['public']['Tables']['invoice_payments']['Row'];
export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];
export type SalaryAdvance = Database['public']['Tables']['salary_advances']['Row'];
export type Occurrence = Database['public']['Tables']['occurrences']['Row'];
export type ExtraReceipt = Database['public']['Tables']['extra_receipts']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type AssetCategory = Database['public']['Tables']['asset_categories']['Row'];
export type AssetLocation = Database['public']['Tables']['asset_locations']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];

// --- EXTENDED & UI TYPES ---
// These types extend the base database types with application-specific properties or are used for UI state.

export type Profile = ProfileRow & {
  company: Company;
}

export type Supplier = SupplierRow & {
  totalDebt?: number;
}

export type Invoice = InvoiceRow & {
  items: InvoiceItem[];
  payments: InvoicePayment[];
  isOffline?: boolean;
}

export type User = Profile;