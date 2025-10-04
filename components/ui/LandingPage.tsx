import React, { useState, useEffect } from 'react';
import type { ViewMode } from '../../App';
import { ICONS } from '../../constants';
import LanguageSelector from '../LanguageSelector';
import CurrencySelector from '../CurrencySelector';
import { useCurrency } from '../../contexts/CurrencyContext';

// Componente Countdown Timer
const CountdownTimer = () => {
  const [daysLeft, setDaysLeft] = useState(4);
  const [hoursLeft, setHoursLeft] = useState(0);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    // Verificar se já existe uma data de início no localStorage
    const startDate = localStorage.getItem('previewStartDate');
    
    if (!startDate) {
      // Se não existe, definir a data atual como data de início
      const now = new Date().toISOString();
      localStorage.setItem('previewStartDate', now);
    }

    const calculateTimeLeft = () => {
      const start = new Date(startDate || new Date().toISOString());
      const now = new Date();
      
      // Calcular a diferença em milissegundos
      const difference = now.getTime() - start.getTime();
      
      // Calcular dias, horas, minutos e segundos restantes
      const totalSeconds = Math.max(0, 4 * 24 * 60 * 60 - Math.floor(difference / 1000));
      
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;
      
      setDaysLeft(days);
      setHoursLeft(hours);
      setMinutesLeft(minutes);
      setSecondsLeft(seconds);
    };

    // Calcular imediatamente
    calculateTimeLeft();

    // Atualizar a cada segundo
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (daysLeft <= 0 && hoursLeft <= 0 && minutesLeft <= 0 && secondsLeft <= 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        margin: '1rem 0',
        borderRadius: '8px',
        border: '1px solid #ff7979',
        boxShadow: '0 4px 6px rgba(255, 107, 107, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>⏰ Período de Pré-visualização Expirado!</span>
          <span>Faça upgrade para premium e continue aproveitando nossos serviços.</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem',
      textAlign: 'center',
      margin: '1rem 0',
      borderRadius: '8px',
      border: '1px solid #7e8ce0',
      boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
    }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>⏳ Oferta por Tempo Limitado: </span>
        <span>Você tem apenas <strong>{daysLeft} dias</strong> de pré-visualização gratuita!</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', minWidth: '50px' }}>
            {daysLeft.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Dias</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', minWidth: '50px' }}>
            {hoursLeft.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Horas</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', minWidth: '50px' }}>
            {minutesLeft.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Minutos</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', minWidth: '50px' }}>
            {secondsLeft.toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Segundos</div>
        </div>
      </div>

      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
        <strong>Não perca esta oportunidade!</strong> Faça upgrade para premium, compre créditos e desfrute do melhor servidor do mercado.
      </div>
    </div>
  );
};

// Interface para FeatureCard
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

// Use explicit props parameter with type
const FeatureCard = (props: FeatureCardProps) => {
  const { icon, title, children } = props;
  return (
    <div className="card" style={{padding: '1.5rem', transition: 'all 0.3s ease', willChange: 'transform'}}>
        <div className="flex items-center gap-4 mb-3">
            <div style={{color: 'var(--color-primary)'}}>{icon}</div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6}}>{children}</p>
    </div>
  );
};

// Interface para PricingCard
interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  popular?: boolean;
  bestValue?: boolean;
  savings?: string;
  onSelectPlan: () => void;
  formatPrice: (price: number) => string;
}

// Use explicit props parameter with type
const PricingCard = (props: PricingCardProps) => {
  const { 
    title, 
    price, 
    description, 
    popular, 
    bestValue, 
    savings, 
    onSelectPlan, 
    formatPrice 
  } = props;
  
  return (
    <div className="card" style={{
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '2rem', 
      marginTop: '1rem', 
      borderColor: popular ? 'var(--color-primary)' : bestValue ? 'var(--color-secondary)' : 'var(--color-border)'
    }}>
        {popular && <span style={{
          position: 'absolute', 
          top: '-0.5rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: 'var(--color-primary)', 
          color: 'white', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          padding: '0.5rem 1rem', 
          borderRadius: '9999px', 
          textTransform: 'uppercase', 
          zIndex: 10, 
          whiteSpace: 'nowrap'
        }}>Mais Popular</span>}
        {bestValue && <span style={{
          position: 'absolute', 
          top: '-0.5rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: 'var(--color-secondary)', 
          color: 'white', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          padding: '0.5rem 1rem', 
          borderRadius: '9999px', 
          textTransform: 'uppercase', 
          zIndex: 10, 
          whiteSpace: 'nowrap'
        }}>Melhor Valor</span>}
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
};

// Interface para LandingPage
interface LandingPageProps {
  onSetViewMode: (mode: ViewMode) => void;
}

// Interface para PricingPlan
interface PricingPlan {
  title: string;
  monthlyPrice: number;
  billingCycleMonths: number;
  description: string;
  popular?: boolean;
  bestValue?: boolean;
}

// Use explicit props parameter with type
const LandingPage = (props: LandingPageProps) => {
  const { onSetViewMode } = props;
  const { formatCurrency: formatCurrencyWithCurrency } = useCurrency();
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const pricingPlans: PricingPlan[] = [
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
      <header style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'hsla(222, 47%, 11%, 0.95)', 
        backdropFilter: 'blur(10px)', 
        zIndex: 1000, 
        borderBottom: '1px solid var(--color-border)', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <nav className="flex justify-between items-center" style={{
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '1rem 1.5rem', 
          minHeight: '70px'
        }}>
          <h1 style={{
            fontSize: '1.5rem', 
            fontWeight: 900, 
            color: 'var(--color-primary)', 
            fontStyle: 'italic'
          }}>Fast Managment</h1>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#funcionalidades" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleScroll(e, 'funcionalidades')} 
                style={{color: 'var(--color-text-secondary)', padding: '0 1rem'}}
              >
                Funcionalidades
              </a>
              <a 
                href="#precos" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleScroll(e, 'precos')} 
                style={{color: 'var(--color-text-secondary)', padding: '0 1rem'}}
              >
                Preços
              </a>
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
        {/* Countdown Timer Section - ADICIONADO */}
        <div style={{ marginTop: '70px' }}>
          <CountdownTimer />
        </div>

        {/* Hero Section */}
        <section style={{padding: '5rem 0 5rem 0', textAlign: 'center'}}>
          <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem'}}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', 
              fontWeight: 900, 
              lineHeight: 1.1
            }}>
              Gestão <span style={{color: 'var(--color-primary)'}}>Simplificada</span> para a Sua Oficina
            </h2>
            <p style={{
              marginTop: '1rem', 
              fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
              color: 'var(--color-text-secondary)', 
              maxWidth: '48rem', 
              margin: '1rem auto 0 auto'
            }}>
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
            <div className="grid" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              <FeatureCard icon={ICONS.AI} title="Diagnóstico com IA">
                Nosso assistente exclusivo analisa os sintomas do veículo e sugere causas, verificações e reparações, otimizando seu tempo.
              </FeatureCard>
              <FeatureCard icon={ICONS.INVOICES} title="Faturação Profissional">
                Crie e envie faturas, cotações e recibos com aparência profissional. Controle pagamentos, descontos e dívidas de forma eficiente.
              </FeatureCard>
              <FeatureCard icon={ICONS.CLOUD_OFF} title="Funciona Offline">
                Continue a trabalhar mesmo sem internet. As suas faturas são guardadas localmente e sincronizadas assim que a ligação voltar. Ideal para a internet instável de Moçambique.
              </FeatureCard>
              <FeatureCard icon={ICONS.PARTS} title="Controlo de Stock">
                Gestão completa de peças, óleos e outros materiais, com controlo de quantidade, preços de compra e de venda para nunca mais ficar sem material.
              </FeatureCard>
              <FeatureCard icon={ICONS.REPORTS} title="Relatórios Financeiros">
                Acompanhe a saúde financeira com relatórios de vendas, despesas, lucros, extratos de conta e um painel visual intuitivo.
              </FeatureCard>
              <FeatureCard icon={ICONS.PERMISSIONS} title="Acesso Multi-Utilizador">
                Crie perfis de acesso para os seus funcionários com permissões personalizadas, garantindo que cada um veja apenas o que precisa.
              </FeatureCard>
              <FeatureCard icon={ICONS.SUPPLIERS} title="Gestão de Fornecedores">
                Mantenha uma lista dos seus fornecedores e controle as suas compras e dívidas pendentes de forma centralizada.
              </FeatureCard>
              <FeatureCard icon={ICONS.EMPLOYEES} title="Recursos Humanos Simplificado">
                Faça a gestão dos seus funcionários, controle salários e registe adiantamentos de forma simples e rápida.
              </FeatureCard>
              <FeatureCard icon={ICONS.ASSETS} title="Gestão de Património">
                Catalogue e controle todas as ferramentas e equipamentos valiosos da sua oficina, sabendo sempre o que tem e onde está.
              </FeatureCard>
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
            <div className="grid" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem', 
              maxWidth: '64rem', 
              margin: '0 auto', 
              paddingTop: '1rem'
            }}>
              {pricingPlans.map((plan: PricingPlan) => {
                const totalCost = plan.monthlyPrice * plan.billingCycleMonths;
                const savings = plan.billingCycleMonths > 1
                  ? (baseMonthlyPrice * plan.billingCycleMonths) - totalCost
                  : undefined;
                
                const finalDescription = plan.billingCycleMonths > 1
                  ? `${plan.description} (${formatCurrencyWithCurrency(totalCost)})`
                  : plan.description;

                // Criar um objeto com as props sem incluir a key
                const pricingCardProps: PricingCardProps = {
                  title: plan.title,
                  price: plan.monthlyPrice,
                  description: finalDescription,
                  popular: plan.popular,
                  bestValue: plan.bestValue,
                  savings: savings ? `Poupe ${formatCurrencyWithCurrency(savings)}!` : undefined,
                  formatPrice: formatCurrencyWithCurrency,
                  onSelectPlan: () => onSetViewMode('registration')
                };

                return (
                  <div key={plan.title}>
                    <PricingCard {...pricingCardProps} />
                  </div>
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
      <footer style={{
        backgroundColor: 'var(--color-surface)', 
        padding: '1.5rem 0', 
        borderTop: '1px solid var(--color-border)'
      }}>
        <div style={{
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1.5rem', 
          textAlign: 'center', 
          color: 'var(--color-text-tertiary)'
        }}>
          &copy; {new Date().getFullYear()} Fast Managment. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
