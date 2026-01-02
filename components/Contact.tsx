
import React, { useState } from 'react';

interface ContactProps {
  onBack: () => void;
  isEmbedded?: boolean;
}

const Contact: React.FC<ContactProps> = ({ onBack, isEmbedded }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={`${isEmbedded ? 'flex-1 min-h-[calc(100vh-72px)]' : 'min-h-screen'} bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-y-auto custom-scrollbar`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 shadow-3xl animate-in zoom-in-95 duration-700 my-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-blue-500/20 mb-6">
            <i className="fas fa-satellite-dish"></i> Signal Link
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Contact Us</h2>
          <p className="text-slate-400 text-sm font-medium">Transmit your feedback or inquiries directly to our neural hub.</p>
        </div>

        {submitted ? (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Transmission Successful</h3>
            <p className="text-slate-400 text-sm">Your packet has been received and queued for processing.</p>
            <button onClick={onBack} className="mt-10 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Return Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email</label>
                <input required type="email" placeholder="john@neural.link" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Inquiry Subject</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                <option value="technical">Technical Calibration</option>
                <option value="knowledge">Knowledge Domain Suggestion</option>
                <option value="billing">Credit & Billing</option>
                <option value="other">General Packet Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Data Payload (Message)</label>
              <textarea required rows={4} placeholder="Begin transmission..." className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-6 py-6 text-sm outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center justify-center gap-3">
              Send <i className="fas fa-paper-plane text-[8px]"></i>
            </button>
          </form>
        )}
      </div>
      
      {!isEmbedded && (
        <button onClick={onBack} className="mt-8 mb-16 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Cancel Transmission
        </button>
      )}
    </div>
  );
};

export default Contact;
