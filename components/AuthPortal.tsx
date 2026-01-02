
import React, { useState } from 'react';
import { StudentAPI } from '../services/api';
import { StudentProfile } from '../types';

interface AuthPortalProps {
  onAuthComplete: (student: StudentProfile) => void;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'reset_password';

const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthComplete, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    parentEmail: '', 
    gradeLevel: 'Grade 10',
    recoveryCode: ''
  });
  const [expectedCode, setExpectedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'register') {
        const student = await StudentAPI.register(formData.fullName, formData.email, formData.password, formData.parentEmail, formData.gradeLevel);
        StudentAPI.setActiveSession(student);
        onAuthComplete(student);
      } else if (mode === 'login') {
        const student = await StudentAPI.login(formData.email, formData.password);
        StudentAPI.setActiveSession(student);
        onAuthComplete(student);
      } else if (mode === 'forgot_password') {
        const code = await StudentAPI.initiatePasswordRecovery(formData.email);
        setExpectedCode(code);
        setMode('reset_password');
        setSuccess(`Authorization token dispatched. For demo: Code is ${code}`);
      } else if (mode === 'reset_password') {
        await StudentAPI.resetPassword(formData.email, formData.recoveryCode, expectedCode, formData.password);
        setMode('login');
        setSuccess('Access key successfully recalibrated. You may now login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'login': return 'student login';
      case 'register': return 'Cognitive Registry';
      case 'forgot_password': return 'Recovery Hub';
      case 'reset_password': return 'Key Reset';
    }
  };

  const getSubTitle = () => {
    switch(mode) {
      case 'login': return 'Secure Student Authentication Protocol';
      case 'register': return 'Enroll in the Neural Knowledge Network';
      case 'forgot_password': return 'Initiate Password Restoration Request';
      case 'reset_password': return 'Finalizing Security Recalibration';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-10 shadow-3xl animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] relative custom-scrollbar">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <i className={`fas ${mode === 'login' ? 'fa-fingerprint' : mode === 'register' ? 'fa-id-card' : 'fa-shield-alt'} text-blue-500 text-2xl`}></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white">
            {getTitle()}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">
            {getSubTitle()}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 text-center animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-8 text-center animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'register') && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
              <input 
                required 
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Ex: Alan Turing" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
              />
            </div>
          )}

          {(mode !== 'reset_password') && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Student ID (Email)</label>
              <input 
                required 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="name@neural.link" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
              />
            </div>
          )}

          {mode === 'reset_password' && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Authorization Token</label>
              <input 
                required 
                type="text" 
                value={formData.recoveryCode}
                onChange={e => setFormData({...formData, recoveryCode: e.target.value})}
                placeholder="6-Digit Code" 
                className="w-full bg-blue-600/5 border border-blue-500/20 rounded-2xl px-6 py-3.5 text-sm text-blue-400 outline-none focus:border-blue-500 transition-all shadow-inner font-mono text-center tracking-[0.5em]" 
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset_password') && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">
                {mode === 'reset_password' ? 'New Access Key' : 'Access Key (Password)'}
              </label>
              <input 
                required 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end pr-2">
              <button 
                type="button" 
                onClick={() => setMode('forgot_password')}
                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Forgot Access Key?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Parent/Guardian Email</label>
                <input 
                  required 
                  type="email" 
                  value={formData.parentEmail}
                  onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                  placeholder="parent@neural.link" 
                  className="w-full bg-black/40 border border-emerald-500/10 rounded-2xl px-6 py-3.5 text-sm text-white outline-none focus:border-emerald-500 transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Processing Tier (Grade)</label>
                <select 
                  value={formData.gradeLevel}
                  onChange={e => setFormData({...formData, gradeLevel: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                {mode === 'login' ? 'Login' : mode === 'register' ? 'Register Student' : mode === 'forgot_password' ? 'Request Recovery' : 'Reset & Restore'} 
                <i className="fas fa-arrow-right text-[8px]"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 items-center">
          {mode === 'login' ? (
            <button 
              onClick={() => setMode('register')}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Register New Student
            </button>
          ) : (
            <button 
              onClick={() => setMode('login')}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Return to Login Terminal
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
