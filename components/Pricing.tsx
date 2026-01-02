
import React from 'react';

interface PricingProps {
  onBack: () => void;
  isEmbedded?: boolean;
}

const Pricing: React.FC<PricingProps> = ({ onBack, isEmbedded }) => {
  const plans = [
    {
      name: "Neural Initiate",
      price: "0",
      description: "Begin your cognitive evolution.",
      features: [
        "1 Knowledge Domain",
        "5 Session Hours / Mo",
        "Standard 2D Visualizations",
        "Public Neural Core",
        "Standard Latency"
      ],
      accent: "text-slate-400",
      bg: "bg-slate-900/40",
      buttonText: "Join Network",
      buttonClass: "bg-white/5 hover:bg-white/10 text-white border border-white/10"
    },
    {
      name: "Core Synchronizer",
      price: "29",
      description: "Deep-link with infinite knowledge.",
      features: [
        "10 Knowledge Domains",
        "Unlimited Session Hours",
        "High-Fidelity 3D Engine",
        "Advanced Empathy Mapping",
        "Priority Signal Path",
        "Ad-Free Processing"
      ],
      accent: "text-blue-400",
      bg: "bg-blue-600/10 border-blue-500/20",
      buttonText: "Synchronize Now",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
      popular: true
    },
    {
      name: "Galactic Entity",
      price: "Custom",
      description: "For organizations and hive-minds.",
      features: [
        "Infinite Knowledge Domains",
        "Dedicated Neural Core",
        "Custom Voice & Replica Synthesis",
        "Full API Integration",
        "24/7 Neural Maintenance",
        "Biometric Authentication"
      ],
      accent: "text-orange-400",
      bg: "bg-orange-600/10 border-orange-500/20",
      buttonText: "Establish Link",
      buttonClass: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
    }
  ];

  return (
    <div className={`${isEmbedded ? 'flex-1 min-h-[calc(100vh-72px)]' : 'min-h-screen'} bg-[#020617] text-white flex flex-col items-center py-20 px-6 relative overflow-hidden`}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-blue-500/20 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <i className="fas fa-credit-card"></i> Protocol Costs
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 animate-in fade-in slide-in-from-bottom-4 duration-700">Pricing Structures</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
          Select your level of neural integration. High-fidelity learning at every tier.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {plans.map((plan, idx) => (
          <div 
            key={plan.name} 
            className={`relative rounded-[3.5rem] p-10 backdrop-blur-3xl border transition-all duration-500 hover:scale-105 hover:shadow-3xl flex flex-col animate-in fade-in zoom-in duration-700 delay-${(idx + 1) * 100} ${plan.bg} ${plan.popular ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-white/5'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/40">
                Optimized Path
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">{plan.name}</h3>
              <p className="text-slate-500 text-sm">{plan.description}</p>
            </div>

            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter">$</span>
              <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest ml-2">/ Cycle</span>}
            </div>

            <div className="flex-1 space-y-5 mb-12">
              {plan.features.map(feature => (
                <div key={feature} className="flex items-center gap-4 group">
                  <div className={`h-5 w-5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] transition-colors group-hover:border-white/20 ${plan.accent}`}>
                    <i className="fas fa-check"></i>
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${plan.buttonClass}`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {!isEmbedded && (
        <button onClick={onBack} className="mt-16 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Return to Core
        </button>
      )}
    </div>
  );
};

export default Pricing;
