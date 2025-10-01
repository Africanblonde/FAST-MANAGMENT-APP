import React from 'react';
import type { AdminDashboardData, LicenseStatus } from '../types';
import { ICONS } from '../constants';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
    <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center gap-4">
            <div style={{ color: 'var(--color-secondary)', backgroundColor: 'hsla(var(--color-secondary-hsl), 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)'}}>
                {icon}
            </div>
            <div>
                <h2 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{title}</h2>
                <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
            </div>
        </div>
    </div>
);

interface StatusBadgeProps {
    status: LicenseStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const styles: Record<LicenseStatus, React.CSSProperties> = {
        'Active': { backgroundColor: 'hsla(139, 60%, 55%, 0.1)', color: 'var(--color-success)' },
        'Trial': { backgroundColor: 'hsla(45, 93%, 58%, 0.1)', color: 'var(--color-warning)' },
        'Expired': { backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--color-danger)' },
    };
    return (
        <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', ...styles[status] }}>
            {status}
        </span>
    );
};

interface SuperAdminPageProps {
    data: AdminDashboardData;
    onLogout: () => void;
}

const SuperAdminPage = ({ data, onLogout }: SuperAdminPageProps) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Painel Super Admin</h1>
                <button onClick={onLogout} className="btn btn-ghost">
                    {ICONS.LOGOUT}
                    <span className="ml-2">Terminar Sessão</span>
                </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total de Empresas" value={data.totalCompanies} icon={ICONS.EMPLOYEES} />
                <StatCard title="Licenças Ativas" value={data.activeLicenses} icon={ICONS.WARRANTY_CHECK} />
                <StatCard title="Expiradas / Em Teste" value={data.expiredOrTrial} icon={ICONS.CLOCK} />
            </section>

            <section className="card table-wrapper">
                 <table className="table">
                    <thead>
                        <tr>
                            <th>Nome da Empresa</th>
                            <th>Email do Admin</th>
                            <th>Status da Licença</th>
                            <th>Expira em</th>
                            <th>Registada em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.companies.map((company) => (
                            <tr key={company.id}>
                                <td className="font-semibold">{company.name}</td>
                                <td>{company.adminEmail}</td>
                                <td><StatusBadge status={company.licenseStatus} /></td>
                                <td>{company.expiresAt ? new Date(company.expiresAt).toLocaleDateString('pt-PT') : 'N/A'}</td>
                                <td>{new Date(company.createdAt).toLocaleDateString('pt-PT')}</td>
                            </tr>
                        ))}
                         {data.companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-400">Nenhuma empresa encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default SuperAdminPage;