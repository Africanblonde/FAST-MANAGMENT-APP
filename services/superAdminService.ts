import { supabase } from './supabaseClient';
import type { AdminDashboardData, Company, CompanyLicense, LicenseStatus, ProfileRow } from '../types';

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    // Fetch all necessary data in parallel
    const [companiesRes, profilesRes, licensesRes] = await Promise.all([
        supabase.from('companies').select('*'),
// FIX: Changed the Supabase query for profiles to `select('*')` to fetch all fields required by the `ProfileRow` type.
        supabase.from('profiles').select('*'),
        supabase.from('company_licenses').select('*')
    ]);

    if (companiesRes.error) throw companiesRes.error;
    if (profilesRes.error) throw profilesRes.error;
    if (licensesRes.error) throw licensesRes.error;

    const companies: Company[] = companiesRes.data || [];
    const profiles: ProfileRow[] = profilesRes.data || [];
    const licenses: CompanyLicense[] = licensesRes.data || [];

    const now = new Date();
    let activeLicenses = 0;

    const companyViews = companies.map(company => {
        const adminUser = profiles.find(p => p.company_id === company.id);
        const latestLicense = licenses
            .filter(l => l.company_id === company.id)
            .sort((a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())[0];
        
        const trialEndDate = new Date(company.trial_ends_at);
        const licenseEndDate = latestLicense ? new Date(latestLicense.expires_at) : null;

        let status: LicenseStatus = 'Expired';
        let expiresAt: string | null = null;
        
        if (licenseEndDate && licenseEndDate > now) {
            status = 'Active';
            expiresAt = licenseEndDate.toISOString();
            activeLicenses++;
        } else if (trialEndDate > now) {
            status = 'Trial';
            expiresAt = trialEndDate.toISOString();
        } else {
             expiresAt = licenseEndDate?.toISOString() || trialEndDate.toISOString();
        }

        return {
            id: company.id,
            name: company.name,
            adminEmail: adminUser?.name || 'N/A',
            createdAt: company.created_at,
            licenseStatus: status,
            expiresAt: expiresAt,
        };
    });

    return {
        totalCompanies: companies.length,
        activeLicenses: activeLicenses,
        expiredOrTrial: companies.length - activeLicenses,
        companies: companyViews.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
};