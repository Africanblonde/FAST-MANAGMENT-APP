import React from 'react';
import type { ViewMode } from '../../App';
import { ICONS } from '../../constants';
import LanguageSelector from '../LanguageSelector';
import CurrencySelector from '../CurrencySelector';
import { useCurrency } from '../../contexts/CurrencyContext';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="card" style={{padding: '1.5rem', transition: 'all 0.3s ease', willChange: 'transform'}}>
        <div className="flex items-center gap-4 mb-3">
            <div style={{color: 'var(--color-primary)'}}>{icon}</div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6}}>{children}</p>
    </div>
);

const PricingCard: React.FC<{ title: string, price: number, description: string, popular?: boolean, bestValue?: boolean, savings?: string, onSelectPlan: () => void, formatPrice: (price: number) => string }> = ({ title, price, description, popular, bestValue, savings, onSelectPlan, formatPrice }) => (
    <div className="card" style={{position: 'relative', display: 'flex', flexDirection: 'column', padding: '2rem', marginTop: '1rem', borderColor: popular ? 'var(--color-primary)' : bestValue ? 'var(--color-secondary)' : 'var(--color-border)'}}>
        {popular && <span style={{position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '9999px', textTransform: 'uppercase', zIndex: 10, whiteSpace: 'nowrap'}}>Mais Popular</span>}
        {bestValue && <span style={{position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-secondary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '9999px', textTransform: 'uppercase', zIndex: 10, whiteSpace: 'nowrap'}}>Melhor Valor</span>}
        <h3 style={{fontSize: '1.5rem', fontWeight: 700, textAlign: 'center'}}>{title}</h3>
        <div style={{margin: '1.5rem 0', textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-primary)'}}>{formatPrice(price)}</div>
            <span style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem'}}>/mês</span>
        </div>
        <p style={{color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '1.5rem', minHeight: '3rem'}}>{description}</p>
        <div style={{marginTop: 'auto'}}>
            <button onClick={onSelectPlan} className={`btn ${popular ? 'btn-primary' : bestValue ? 'btn-secondary' : 'btn-ghost'}`} style={{width: '100%', fontSize: '1.125rem'}}>
                Começar Agora
            </button>
            {savings && <p style={{textAlign: 'center', color: 'var(--color-success)', fontWeight: 600, marginTop: '1rem'}}>{savings}</p>}
        </div>
    </div>
);

const LandingPage: React.FC<{ onSetViewMode: (mode: ViewMode) => void; }> = ({ onSetViewMode }) => {
    const { formatCurrency: formatCurrencyWithCurrency } = useCurrency();
    
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80; // Space for the fixed header
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const pricingPlans = [
        {
            title: "Plano Mensal",
            monthlyPrice: 2000,
            billingCycleMonths: 1,
            description: "Flexibilidade total para o seu negócio.",
        },
        {
            title: "Plano Semestral",
            monthlyPrice: 1500,
            billingCycleMonths: 6,
            description: "pago semestralmente",
            popular: true,
        },
        {
            title: "Plano Anual",
            monthlyPrice: 1000,
            billingCycleMonths: 12,
            description: "pago anualmente",
            bestValue: true,
        }
    ];

    const baseMonthlyPrice = pricingPlans.find(p => p.billingCycleMonths === 1)?.monthlyPrice || 2000;

    return (
        <div>
            {/* Header */}
            <header style={{position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'hsla(222, 47%, 11%, 0.95)', backdropFilter: 'blur(10px)', zIndex: 1000, borderBottom: '1px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                <nav className="flex justify-between items-center" style={{maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', minHeight: '70px'}}>
                    <h1 style={{fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', fontStyle: 'italic'}}>Fast Managment</h1>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#funcionalidades" onClick={(e) => handleScroll(e, 'funcionalidades')} style={{color: 'var(--color-text-secondary)', padding: '0 1rem'}}>Funcionalidades</a>
                            <a href="#precos" onClick={(e) => handleScroll(e, 'precos')} style={{color: 'var(--color-text-secondary)', padding: '0 1rem'}}>Preços</a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CurrencySelector />
                            <LanguageSelector />
                        </div>
                        <button onClick={() => onSetViewMode('login')} className="btn btn-ghost">
                            Login
                        </button>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section style={{padding: '10rem 0 5rem 0', textAlign: 'center'}}>
                    <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem'}}>
                        <h2 style={{fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 900, lineHeight: 1.1}}>
                            Gestão <span style={{color: 'var(--color-primary)'}}>Simplificada</span> para a Sua Oficina
                        </h2>
                        <p style={{marginTop: '1rem', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--color-text-secondary)', maxWidth: '48rem', margin: '1rem auto 0 auto'}}>
                            Tudo o que precisa para gerir clientes, viaturas, faturas e diagnósticos com IA,
                            num só lugar. Comece hoje com um <span style={{fontWeight: 700, color: 'var(--color-warning)'}}>teste gratuito de 14 dias!</span>
                        </p>
                        <button 
                            onClick={() => onSetViewMode('registration')} 
                            className="btn btn-primary"
                            style={{marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.25rem'}}
                        >
                            Criar Conta Grátis
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section id="funcionalidades" style={{padding: '5rem 0'}}>
                    <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem'}}>
                        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                            <h2>Funcionalidades Exclusivas</h2>
                            <p style={{marginTop: '0.5rem', color: 'var(--color-text-secondary)'}}>Tudo o que precisa para levar a gestão da sua oficina para o próximo nível.</p>
                        </div>
                        <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
                            <FeatureCard icon={ICONS.AI} title="Diagnóstico com IA" children="Nosso assistente exclusivo analisa os sintomas do veículo e sugere causas, verificações e reparações, otimizando seu tempo." />
                             <FeatureCard icon={ICONS.INVOICES} title="Faturação Profissional" children="Crie e envie faturas, cotações e recibos com aparência profissional. Controle pagamentos, descontos e dívidas de forma eficiente." />
                            <FeatureCard icon={ICONS.CLOUD_OFF} title="Funciona Offline" children="Continue a trabalhar mesmo sem internet. As suas faturas são guardadas localmente e sincronizadas assim que a ligação voltar. Ideal para a internet instável de Moçambique." />
                            <FeatureCard icon={ICONS.PARTS} title="Controlo de Stock" children="Gestão completa de peças, óleos e outros materiais, com controlo de quantidade, preços de compra e de venda para nunca mais ficar sem material." />
                            <FeatureCard icon={ICONS.REPORTS} title="Relatórios Financeiros" children="Acompanhe a saúde financeira com relatórios de vendas, despesas, lucros, extratos de conta e um painel visual intuitivo." />
                            <FeatureCard icon={ICONS.PERMISSIONS} title="Acesso Multi-Utilizador" children="Crie perfis de acesso para os seus funcionários com permissões personalizadas, garantindo que cada um veja apenas o que precisa." />
                             <FeatureCard icon={ICONS.SUPPLIERS} title="Gestão de Fornecedores" children="Mantenha uma lista dos seus fornecedores e controle as suas compras e dívidas pendentes de forma centralizada." />
                            <FeatureCard icon={ICONS.EMPLOYEES} title="Recursos Humanos Simplificado" children="Faça a gestão dos seus funcionários, controle salários e registe adiantamentos de forma simples e rápida." />
                             <FeatureCard icon={ICONS.ASSETS} title="Gestão de Património" children="Catalogue e controle todas as ferramentas e equipamentos valiosos da sua oficina, sabendo sempre o que tem e onde está." />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="precos" style={{padding: '5rem 0'}}>
                    <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem'}}>
                        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                            <h2>Um Preço Simples e Justo</h2>
                            <p style={{marginTop: '0.5rem', color: 'var(--color-text-secondary)'}}>
                                Comece com um <span style={{fontWeight: 700, color: 'var(--color-warning)'}}>teste gratuito de 14 dias</span> com acesso a todas as funcionalidades. Sem compromisso, sem necessidade de cartão de crédito.
                            </p>
                        </div>
                        <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '64rem', margin: '0 auto', paddingTop: '1rem'}}>
                            {pricingPlans.map(plan => {
                                const totalCost = plan.monthlyPrice * plan.billingCycleMonths;
                                const savings = plan.billingCycleMonths > 1
                                    ? (baseMonthlyPrice * plan.billingCycleMonths) - totalCost
                                    : undefined;
                                
                                const finalDescription = plan.billingCycleMonths > 1
                                    ? `${plan.description} (${formatCurrencyWithCurrency(totalCost)})`
                                    : plan.description;

                                return (
                                    <PricingCard 
                                        key={plan.title}
                                        title={plan.title}
                                        price={plan.monthlyPrice}
                                        description={finalDescription}
                                        popular={plan.popular}
                                        bestValue={plan.bestValue}
                                        savings={savings ? `Poupe ${formatCurrencyWithCurrency(savings)}!` : undefined}
                                        formatPrice={formatCurrencyWithCurrency}
                                        onSelectPlan={() => onSetViewMode('registration')}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
                
                {/* Payment Info Section */}
                <section style={{padding: '0 0 5rem 0'}}>
                    <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center'}}>
                         <h2>Como Pagar Após o Teste</h2>
                         <div className="card" style={{padding: '1.5rem', maxWidth: '28rem', margin: '1rem auto 0 auto'}}>
                            <p style={{fontSize: '1.125rem'}}><strong>M-Pesa:</strong> 849069325</p>
                            <p style={{fontSize: '1.125rem'}}><strong>E-Mola:</strong> 879069325</p>
                            <p style={{fontSize: '1.125rem', marginTop: '0.5rem'}}><strong>Linha do Cliente:</strong> 875804823 (Vukani Labs)</p>
                            <p style={{marginTop: '0.5rem', color: 'var(--color-text-secondary)'}}>Nome do Titular: <strong>David Zacarias Mulanga Júnior</strong></p>
                         </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{backgroundColor: 'var(--color-surface)', padding: '1.5rem 0', borderTop: '1px solid var(--color-border)'}}>
                <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', color: 'var(--color-text-tertiary)'}}>
                    &copy; {new Date().getFullYear()} Fast Managment. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;