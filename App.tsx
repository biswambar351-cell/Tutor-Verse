
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { TutorState, VizCommand, SubjectConfig, StudentProfile } from './types.ts';
import { tutorBrain, vizTools } from './services/geminiService.ts';
import { simliClient } from './services/simliService.ts';
import { NeuralAPI, StudentAPI } from './services/api.ts';
import Avatar from './components/Avatar.tsx';
import NeuralLaboratory from './components/MathVisualizer.tsx';
import CMS from './components/CMS.tsx';
import AuthPortal from './components/AuthPortal.tsx';
import Pricing from './components/Pricing.tsx';
import Contact from './components/Contact.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'setup' | 'tutor' | 'cms' | 'pricing' | 'dashboard' | 'contact'>('home');
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [state, setState] = useState<TutorState>(TutorState.IDLE);
  const [selectedSubject, setSelectedSubject] = useState<SubjectConfig | null>(null);
  const [vizCommand, setVizCommand] = useState<VizCommand | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [simliStream, setSimliStream] = useState<MediaStream | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [transcription, setTranscription] = useState<string>("");

  const micStreamRef = useRef<MediaStream | null>(null);
  const [formData, setFormData] = useState({ subjectId: '' });

  useEffect(() => {
    const init = async () => { 
      try {
        const subList = await NeuralAPI.getSubjects();
        setSubjects(subList); 
        const session = StudentAPI.getActiveSession();
        setStudent(session);
      } catch (e) {
        console.error("Initialization error:", e);
      }
    };
    init();
  }, []);

  const stopAllAudio = useCallback(() => {
    setIsSpeaking(false);
  }, []);

  const handleLogout = useCallback(() => {
    StudentAPI.setActiveSession(null);
    setStudent(null);
    setView('home');
  }, []);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startLiveSession = useCallback(async (subject: SubjectConfig) => {
    const key = process.env.API_KEY;
    if (!key) {
      console.warn("[Neural Link] API Key missing. Communication may fail.");
    }

    const ai = new GoogleGenAI({ apiKey: key || "" });
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = micStream;

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("[App] Neural Link Established");
          const source = inputAudioContext.createMediaStreamSource(micStream);
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => (prev + " " + message.serverContent?.outputTranscription?.text).slice(-500));
          }
          
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'updateVisualization') {
                setVizCommand(fc.args as any);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "Visualization Updated" } }
                }));
              }
            }
          }

          const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            setIsSpeaking(true);
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            simliClient.sendAudioData(bytes);
          }

          if (message.serverContent?.turnComplete) {
            setIsSpeaking(false);
          }
        },
        onerror: (e) => console.error("Neural Link Error", e),
        onclose: () => console.log("Neural Link Closed"),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: tutorBrain.getPersonaPrompt('adult', TutorState.TEACHING),
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: subject.voiceId || 'Zephyr' } },
        },
        tools: [{ functionDeclarations: vizTools }],
      } as any,
    });
  }, []);

  const handleStartLesson = async () => {
    const sub = subjects.find(s => s.id === formData.subjectId);
    if (!sub) return;
    setSelectedSubject(sub);
    setView('tutor');
    setState(TutorState.TEACHING);
    await simliClient.connect(sub.faceId, s => setSimliStream(s));
    await startLiveSession(sub);
  };

  const handleExitLesson = () => {
    stopAllAudio();
    simliClient.disconnect();
    setSimliStream(null);
    setView('home');
    setState(TutorState.IDLE);
    micStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col pt-[72px]">
      <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-8 py-4 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform"><i className="fas fa-brain text-white"></i></div>
              <span className="text-xl font-black tracking-tighter uppercase text-white">Tutor Verse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <button onClick={() => setView('home')} className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>Home</button>
                  <button onClick={() => setView('setup')} className={`hover:text-white transition-colors ${view === 'setup' ? 'text-white' : ''}`}>Classroom</button>
                  <button onClick={() => setView('pricing')} className={`hover:text-white transition-colors ${view === 'pricing' ? 'text-white' : ''}`}>Pricing</button>
                  <button onClick={() => setView('contact')} className={`hover:text-white transition-colors ${view === 'contact' ? 'text-white' : ''}`}>Contact</button>
              </div>
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setView('cms')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${view === 'cms' ? 'bg-orange-600/10 border-orange-500/50 text-orange-500' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}>
                    <i className="fas fa-terminal text-[8px]"></i> Admin
                  </button>
                  {student ? (
                    <button onClick={() => setView('dashboard')} className={`px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:scale-105 transition-all flex items-center gap-2 ${view === 'dashboard' ? 'ring-2 ring-blue-400' : ''}`}>
                      <i className="fas fa-user-circle text-xs"></i> {student.fullName.split(' ')[0]}
                    </button>
                  ) : (
                    <button onClick={() => setShowAuth(true)} className="px-5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                      <i className="fas fa-sign-in-alt text-[8px]"></i> User Login
                    </button>
                  )}
              </div>
          </div>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {view === 'setup' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-white">Academic Setup</h2>
              <div className="space-y-4 mb-10 text-left">
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-4 mb-2 block">Knowledge Domain</label>
                   <select value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all">
                    <option value="">Select Domain</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title} ({s.classLevel})</option>)}
                   </select>
                </div>
                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Neural Connection</p>
                   <p className="text-[10px] text-slate-500 leading-relaxed uppercase">High-fidelity avatar synthesis using Simli & Gemini Live.</p>
                </div>
              </div>
              <button onClick={handleStartLesson} disabled={!formData.subjectId} className="w-full py-6 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] disabled:opacity-30 shadow-xl shadow-blue-900/40 transition-transform active:scale-95">Establish Link</button>
            </div>
          </div>
        )}

        {view === 'tutor' && (
          <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 bg-black relative animate-in fade-in duration-700">
              <div className="w-full md:w-96 bg-slate-900/40 rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-full z-40 relative">
                  <Avatar isSpeaking={isSpeaking} volume={0} simliStream={simliStream} subjectTitle={selectedSubject?.title} />
                  
                  <div className="mt-8 flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Internal Mind Stream</p>
                      <div className="text-[11px] text-slate-300 leading-relaxed italic">
                        {transcription || "Establishing neural synchronization..."}
                      </div>
                  </div>

                  <button onClick={handleExitLesson} className="mt-6 py-4 bg-white/5 text-slate-500 text-[9px] font-black uppercase rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">End session</button>
              </div>
              <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <NeuralLaboratory command={vizCommand} />
              </div>
          </div>
        )}

        {view === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="mb-6 h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
             <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Neural Tutor.</h1>
             <p className="max-w-xl text-slate-400 text-lg mb-12 font-medium">Academic excellence through rigorous textbook synthesis and visual reasoning.</p>
             <div className="flex gap-4">
                <button onClick={() => setView('setup')} className="px-14 py-6 bg-blue-600 text-white font-black rounded-full uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-900/40 hover:scale-105 transition-all">Get Started</button>
             </div>
          </div>
        )}

        {view === 'cms' && <CMS onClose={() => setView('home')} isEmbedded />}
        {view === 'pricing' && <Pricing onBack={() => setView('home')} isEmbedded />}
        {view === 'contact' && <Contact onBack={() => setView('home')} isEmbedded />}
        {view === 'dashboard' && student && (
          <StudentDashboard 
            student={student} 
            onLogout={handleLogout} 
            onStartLearning={() => setView('setup')}
            onStartExam={(t, m) => console.log('Starting exam', t, m)} 
          />
        )}
      </main>

      {showAuth && (
        <AuthPortal onAuthComplete={(s) => {setStudent(s); setShowAuth(false); setView('dashboard');}} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
};

export default App;
