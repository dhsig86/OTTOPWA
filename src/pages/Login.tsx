import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const BETA_WHITELIST: Record<string, { name: string; profile: 'medico' | 'estudante' | 'paciente'; pass: string }> = {
    'dr.dhsig@gmail.com': { name: 'Dr. Dario Hart', profile: 'medico', pass: '12345678' },
    'medico@otto.com': { name: 'Médico Teste', profile: 'medico', pass: '12345678' },
    'estudante@otto.com': { name: 'Residente Teste', profile: 'estudante', pass: '12345678' },
    'paciente@otto.com': { name: 'Paciente Teste', profile: 'paciente', pass: '12345678' },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier || !password) return;
    
    const user = BETA_WHITELIST[identifier.toLowerCase().trim()];
    if (!user || user.pass !== password) {
      setErrorMsg('Credenciais inválidas para o acesso restrito (Beta).');
      return;
    }
    
    login(crypto.randomUUID(), user.name, user.profile);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CDF0E3] via-white to-[#1D9E75]/5 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-sm space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/60 relative"
      >
        
        <div className="text-center space-y-2">
          <div className="w-24 h-24 bg-[#1D9E75] rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-lg">
             <span className="text-white font-black text-3xl tracking-tighter">O</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">HART'S OTTO</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">E-mail ou Celular</label>
            <input 
              type="text" 
              placeholder="Ex: dr.dhsig@gmail.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#CDF0E3] transition-all outline-none text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Senha de Acesso</label>
            <input 
              type="password" 
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#CDF0E3] transition-all outline-none text-sm"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-xs font-semibold text-center">{errorMsg}</p>
          )}

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
