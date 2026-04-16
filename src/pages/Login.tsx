import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [profileSelect, setProfileSelect] = useState<'medico' | 'estudante' | 'paciente'>('medico');
  const [identifier, setIdentifier] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    
    // Simple mock logic for beta testing
    login(`usr_${Math.random().toString(36).substr(2, 9)}`, profileSelect);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CDF0E3] via-white to-[#1D9E75]/5 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-sm space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/60"
      >
        
        <div className="text-center space-y-2">
          <div className="w-24 h-24 bg-[#1D9E75] rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-lg">
             <span className="text-white font-black text-3xl tracking-tighter">O</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">HART'S OTTO</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">Eu sou um(a)...</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'medico', label: 'Médico' },
                { id: 'estudante', label: 'Estudante' },
                { id: 'paciente', label: 'Paciente' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfileSelect(p.id as any)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
                    profileSelect === p.id 
                      ? 'border-[#1D9E75] bg-[#E1F7EE] text-[#056143] shadow-sm' 
                      : 'border-gray-200 text-gray-500 hover:border-[#1D9E75]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">E-mail ou Celular</label>
            <input 
              type="text" 
              placeholder="Digite seu acesso..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#CDF0E3] transition-all outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#0A865F] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Avançar
          </button>
          
        </form>

        <p className="text-center text-xs text-gray-400 pt-6">
          Ambiente restrito de acesso Antecipado (Beta)
        </p>

      </motion.div>
    </div>
  );
};
