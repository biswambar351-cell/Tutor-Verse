
import React, { useEffect, useState, useMemo } from 'react';
import { StudentProfile, SubjectConfig, ExamMode } from '../types';
import { NeuralAPI } from '../services/api';

interface StudentDashboardProps {
  student: StudentProfile;
  onLogout: () => void;
  onStartLearning: () => void;
  onStartExam: (type: 'weekly' | 'monthly', mode: ExamMode) => void;
}

const MasteryGauge = ({ percent, size = 120, strokeWidth = 8, color = "stroke-blue-500", label = "" }: { percent: number, size?: number, strokeWidth?: number, color?: string, label?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle className="text-white/5" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={`${color} transition-all duration-1000 ease-out`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-white">{percent}%</span>
        {label && <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onLogout, onStartLearning, onStartExam }) => {
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [completedStats, setCompletedStats] = useState<Record<string, string[]>>({});
  const [examTypeSelect, setExamTypeSelect] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const loadData = async () => {
      const s = await NeuralAPI.getSubjects(); setSubjects(s);
      const progress = JSON.parse(localStorage.getItem('tutorverse_progress') || '{}');
      setCompletedStats(progress);
    };
    loadData();
  }, []);

  const calculatePercent = (subject: SubjectConfig) => {
    const completed = completedStats[subject.id] || [];
    return Math.round((completed.length / (subject.chapters.length || 1)) * 100);
  };

  const totalIntegration = useMemo(() => {
    if (subjects.length === 0) return 0;
    return Math.round(subjects.reduce((acc, sub) => acc + calculatePercent(sub), 0) / subjects.length);
  }, [subjects, completedStats]);

  const examAverages = useMemo(() => {
    if (student.examHistory.length === 0) return { weekly: 0, monthly: 0, cheats: 0 };
    const weekly = student.examHistory.filter(e => e.type === 'weekly' && e.status !== 'cheated');
    const monthly = student.examHistory.filter(e => e.type === 'monthly' && e.status !== 'cheated');
    const cheats = student.examHistory.filter(e => e.status === 'cheated').length;
    const avg = (arr: any[]) => arr.length ? Math.round((arr.reduce((acc, v) => acc + (v.score / v.total), 0) / arr.length) * 100) : 0;
    return { weekly: avg(weekly), monthly: avg(monthly), cheats };
  }, [student.examHistory]);

  return (
    <div className="flex-1 bg-[#020617] p-8 md:p-12 overflow-y-auto custom-scrollbar min-h-[calc(100vh-72px)]">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        
        <div className="bg-slate-900/40 rounded-[4rem] p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-3xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="h-32 w-32 rounded-[2.5rem] bg-slate-950 flex items-center justify-center text-5xl font-black text-white border border-white/10">
              {student.fullName.charAt(0)}
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-emerald-500/20 mb-4">
                <i className="fas fa-brain"></i> Neural Synchronized
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">{student.fullName}</h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Registry: {student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <MasteryGauge percent={totalIntegration} size={140} strokeWidth={10} color="stroke-blue-500" label="Global Mastery" />
            <div className="flex flex-col gap-4">
               <button onClick={onStartLearning} className="px-10 py-5 bg-white text-black font-black rounded-3xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Resume Units</button>
               <button onClick={onLogout} className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500">Logoff</button>
            </div>
          </div>
        </div>

        {/* Exam Center */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-12 overflow-hidden relative">
           <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="max-w-md">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Exam Center</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                   Formal timed assessments cover all synthesized knowledge domains. Select a mode to begin.
                 </p>
                 <div className="flex gap-4">
                    <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Weekly Avg</span>
                       <span className="text-2xl font-black text-white">{examAverages.weekly}%</span>
                    </div>
                    {examAverages.cheats > 0 && (
                      <div className="bg-red-500/10 px-6 py-4 rounded-2xl border border-red-500/20">
                         <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Integrity Flags</span>
                         <span className="text-2xl font-black text-red-500">{examAverages.cheats}</span>
                      </div>
                    )}
                 </div>
              </div>
              
              <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 w-full lg:w-96">
                 <div className="flex gap-2 mb-6">
                    <button onClick={() => setExamTypeSelect('weekly')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${examTypeSelect === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>Weekly</button>
                    <button onClick={() => setExamTypeSelect('monthly')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${examTypeSelect === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>Monthly</button>
                 </div>
                 <div className="space-y-3">
                    <button onClick={() => onStartExam(examTypeSelect, 'proctored')} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-3">
                       <i className="fas fa-video text-[8px]"></i> AI-Proctored Offline
                    </button>
                    <button onClick={() => onStartExam(examTypeSelect, 'online')} className="w-full py-5 bg-white/5 text-slate-400 border border-white/10 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                       Standard Online
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-slate-900/30 rounded-[3.5rem] border border-white/5 p-10 flex flex-col group hover:bg-slate-900/50 transition-all">
              <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-6">
                    <div className={`h-16 w-16 bg-black rounded-2xl flex items-center justify-center ${subject.accentColor} text-2xl`}>
                       <i className={`fas ${subject.icon}`}></i>
                    </div>
                    <h4 className="text-xl font-black text-white">{subject.title}</h4>
                 </div>
                 <MasteryGauge percent={calculatePercent(subject)} size={70} strokeWidth={6} color={subject.accentColor.includes('blue') ? 'stroke-blue-500' : 'stroke-purple-500'} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
