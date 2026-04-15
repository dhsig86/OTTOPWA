import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Header Visual */}
        <div className="text-center space-y-2">
          <div className="w-24 h-24 bg-otto-teal rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-lg">
             <span className="text-white font-black text-3xl tracking-tighter">O</span>
          </div>
          <h1 className="text-2xl font-bold text-otto-text tracking-tight">OTTO PWA</h1>
          <p className="text-otto-muted text-sm">Seu ecossistema unificado ORL/CCP</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-otto-text">Eu sou um(a)...</label>
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
                      ? 'border-otto-teal bg-otto-teal-light text-otto-teal-darker shadow-sm' 
                      : 'border-otto-border text-otto-muted hover:border-otto-teal-mid'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-otto-text">E-mail ou Celular</label>
            <input 
              type="text" 
              placeholder="Digite seu acesso..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-otto-border bg-gray-50 focus:bg-white focus:border-otto-teal focus:ring-2 focus:ring-otto-teal-light transition-all outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-otto-teal hover:bg-otto-teal-dark text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Avançar
          </button>
          
        </form>

        <p className="text-center text-xs text-otto-muted pt-6">
          Ambiente restrito de acesso Antecipado (Beta)
        </p>

      </div>
    </div>
  );
};
