import React from 'react';
import Navbar from '../components/Navbar';

// Icons
const IconCheck = () => <span className="text-2xl">✓</span>;
const IconCrown = () => <span className="text-4xl">👑</span>;
const IconSparkle = () => <span className="text-2xl">✨</span>;
const IconRocket = () => <span className="text-2xl">🚀</span>;
const IconZap = () => <span className="text-2xl">⚡</span>;

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
}

export default function Subscription() {

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out TestGenie',
      features: [
        '10 test cases per month',
        'Basic coverage analysis',
        'Python support only',
        'Community support',
        'Standard generation speed'
      ],
      icon: <IconSparkle />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      description: 'For professional developers',
      features: [
        'Unlimited test cases',
        'Advanced coverage analysis',
        'Multi-language support',
        'Priority support',
        'Fast generation speed',
        'Custom test templates',
        'Export to multiple formats'
      ],
      highlighted: true,
      icon: <IconRocket />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'SSO authentication',
        'Custom integrations',
        'Dedicated support',
        'On-premise deployment',
        'Custom training models',
        'SLA guarantee'
      ],
      icon: <IconCrown />
    }
  ];

  const handleSubscribe = (planId: string) => {
    // Handle subscription logic here
    console.log(`Subscribing to ${planId} plan`);
    // Navigate to payment or success page
  };

  return (
    <div className="min-h-screen text-text font-sans">
      {/* Orbs */}
      <div className="orb orb-1 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(0,229,255,0.07),transparent_70%)] top-[-50px] right-[-50px]" />
      <div className="orb orb-2 w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent_70%)] bottom-[50px] left-[-50px] [animation-delay:-4s]" />

      {/* Nav */}
      <Navbar showBackButton={true} />

      {/* Main Content Container */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

      {/* Hero Section */}
      <section className="pt-12 pb-8 text-center relative z-[1]">
        <div className="wrapper max-w-[1280px] mx-auto px-6">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded-full text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              <IconZap />
              Unlock Premium Features
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              Choose Your
              <span className="block text-accent">TestGenie Plan</span>
            </h1>
            <p className="text-base text-text-dim max-w-xl mx-auto leading-relaxed">
              From hobby projects to enterprise solutions
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-8 relative z-[1]">
        <div className="wrapper max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-surface border rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
                  plan.highlighted
                    ? 'border-accent shadow-[0_0_30px_rgba(0,229,255,0.2)] scale-105'
                    : 'border-border hover:border-border-bright'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-accent text-bg px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-extrabold text-accent mb-2">
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-sm text-text-dim font-normal">/month</span>}
                  </div>
                  <p className="text-text-dim text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, plan.id === 'free' ? 5 : 6).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-accent3/10 rounded-full flex items-center justify-center mt-0.5">
                        <IconCheck />
                      </div>
                      <span className="text-xs text-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-accent text-bg hover:bg-[#33eaff] hover:shadow-lg hover:shadow-accent/25 transform hover:-translate-y-1'
                      : 'bg-surface2 border border-border text-text hover:bg-surface hover:border-accent hover:text-accent'
                  }`}
                >
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-faint relative z-[1] flex-shrink-0">
        <div className="wrapper">
          <strong className="text-text-dim">TestGenie</strong> — AI Unit Test Generator &nbsp;·&nbsp;
        </div>
      </footer>
        </div>
      </div>
    </div>
  );
}
