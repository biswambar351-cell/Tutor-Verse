
import React, { useState, useEffect } from 'react';
import { SubjectConfig } from '../types';
import { NeuralAPI } from '../services/api';
import { GEMINI_VOICES } from '../services/geminiService';
import { PREMIUM_VOICES } from '../services/speechifyService';

interface CMSProps {
  onClose: () => void;
  isEmbedded?: boolean;
}

const CMS: React.FC<CMSProps> = ({ onClose, isEmbedded }) => {
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [editingSubject, setEditingSubject] = useState<Partial<SubjectConfig> | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'neural'>('basic');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setSubjects(await NeuralAPI.getSubjects());
  };

  const saveSubject = async () => {
    if (!editingSubject?.id || !editingSubject.title) return;
    const updated = subjects.find(s => s.id === editingSubject.id)
      ? subjects.map(s => s.id === editingSubject.id ? { ...s, ...editingSubject } as SubjectConfig : s)
      : [...subjects, { ...editingSubject, chapters: [], voiceService: 'gemini', speechifyVoiceId: 'henry' } as SubjectConfig];
    await NeuralAPI.saveSubjects(updated);
    setSubjects(updated);
    setEditingSubject(null);
  };

  const simulateAvatarSynthesis = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setEditingSubject({
        ...editingSubject,
        faceId: `face_${Math.random().toString(36).substr(2, 12)}`,
        isCustomAvatar: true
      });
      setIsSynthesizing(false);
    }, 4000);
  };

  return (
    <div className="flex-1 bg-black p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Domain Terminal</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Knowledge Management & Avatar Synthesis</p>
          </div>
          <button onClick={() => setEditingSubject({ id: `sub_${Date.now()}`, voiceId: 'Zephyr', voiceService: 'gemini', speechifyVoiceId: 'henry' })} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
             <i className="fas fa-plus mr-2"></i> New Domain
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(s => (
            <div key={s.id} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-blue-400 border border-white/5">
                      <i className={`fas ${s.icon || 'fa-brain'}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-white">{s.title}</h3>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-500">{s.classLevel} • {s.board}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest">
                       {s.voiceService?.toUpperCase()} ENGINE
                    </span>
                    {s.isCustomAvatar && (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                         CUSTOM AVATAR
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => {setEditingSubject(s); setActiveTab('basic');}} className="text-slate-600 hover:text-white transition-colors p-2"><i className="fas fa-cog"></i></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingSubject && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-10 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-3xl">
            
            <div className="flex gap-6 mb-10 border-b border-white/5">
               <button onClick={() => setActiveTab('basic')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'basic' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}>Basic Configuration</button>
               <button onClick={() => setActiveTab('neural')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'neural' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500'}`}>Avatar Synthesis Lab</button>
            </div>

            {activeTab === 'basic' ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Domain Title</label>
                  <input type="text" placeholder="Title" value={editingSubject.title || ''} onChange={e => setEditingSubject({...editingSubject, title: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Board</label>
                    <input type="text" value={editingSubject.board || ''} onChange={e => setEditingSubject({...editingSubject, board: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Grade</label>
                    <input type="text" value={editingSubject.classLevel || ''} onChange={e => setEditingSubject({...editingSubject, classLevel: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Voice Engine</label>
                      <select value={editingSubject.voiceService} onChange={e => setEditingSubject({...editingSubject, voiceService: e.target.value as any})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none">
                        <option value="gemini">Gemini Neural</option>
                        <option value="speechify">Speechify Premium</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Voice ID</label>
                      <input type="text" value={editingSubject.voiceId || ''} onChange={e => setEditingSubject({...editingSubject, voiceId: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Icon (FontAwesome)</label>
                  <input type="text" placeholder="fa-brain" value={editingSubject.icon || ''} onChange={e => setEditingSubject({...editingSubject, icon: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500" />
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-emerald-500/10">
                   <div className="flex items-center justify-between mb-6">
                      <h5 className="text-sm font-black text-white uppercase tracking-widest">Digital Identity Synthesis</h5>
                      {editingSubject.isCustomAvatar && <span className="text-[8px] font-black text-emerald-500 uppercase">Status: Synced</span>}
                   </div>
                   <p className="text-[10px] text-slate-500 uppercase leading-relaxed mb-6">Create a high-fidelity digital twin for this knowledge domain. You can provide a custom Simli Face ID or synthesize a new identity.</p>
                   
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Simli Face ID</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000" 
                          value={editingSubject.faceId || ''} 
                          onChange={e => setEditingSubject({...editingSubject, faceId: e.target.value})}
                          className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={simulateAvatarSynthesis}
                          disabled={isSynthesizing}
                          className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                          {isSynthesizing ? 'Baking Identity...' : 'Synthesize New Identity'}
                        </button>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Neural Recommendation</p>
                   <p className="text-[10px] text-slate-400 uppercase leading-tight italic">Synthetic avatars perform 40% better in maintaining student focus during long technical sessions.</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-10 mt-6 border-t border-white/5">
              <button onClick={saveSubject} className="flex-1 py-5 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Apply Terminal Changes</button>
              <button onClick={() => setEditingSubject(null)} className="flex-1 py-5 bg-white/5 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMS;
