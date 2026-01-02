
import React, { useEffect, useRef } from 'react';
import { AgeGroup } from '../types';

interface AvatarProps {
  isSpeaking: boolean;
  volume: number;
  simliStream?: MediaStream | null;
  ageGroup?: AgeGroup;
  subjectTitle?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  isSpeaking, 
  simliStream, 
  ageGroup = 'adult',
  subjectTitle = "General Tutor"
}) => {
  const simliVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (simliStream && simliVideoRef.current) {
      simliVideoRef.current.srcObject = simliStream;
    }
  }, [simliStream]);

  return (
    <div className={`relative w-full aspect-square max-w-[320px] mx-auto rounded-[3.5rem] overflow-hidden border-4 transition-all duration-700 shadow-2xl bg-[#020617] ${
        isSpeaking ? 'border-blue-500 shadow-blue-500/40' : 'border-slate-800'
      }`}>
      
      {simliStream ? (
        <video ref={simliVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
           <i className="fas fa-user-robot text-4xl text-slate-700"></i>
        </div>
      )}
      
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
              <div className={`h-1.5 w-1.5 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">
                Neural Link: {isSpeaking ? 'Streaming' : 'Idle'}
              </span>
          </div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
            <span className="text-[8px] font-black text-white/80 uppercase tracking-tighter">{subjectTitle}</span>
          </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] bg-slate-950/90 backdrop-blur-md inline-block px-5 py-2 rounded-full border border-slate-800 text-slate-500">
              Formal Academic Synthesis
          </div>
      </div>
    </div>
  );
};

export default Avatar;
