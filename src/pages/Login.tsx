import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<'medico' | 'estudante' | 'paciente'>('medico');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier || !password) return;
    
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier.trim(), password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      // Defaulting profile as medico for now, until we sync with Firestore.
      login(user.uid, user.email || 'Usuário', selectedProfile, token);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha no Firebase.');
    } finally {
      setIsLoading(false);
    }
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
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">Sou um(a):</label>
            <div className="flex gap-2 w-full">
              {(['medico', 'estudante', 'paciente'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedProfile(p)}
                  className={`flex-1 py-2 px-2 rounded-full text-sm font-bold transition-all border ${
                    selectedProfile === p
                      ? p === 'medico'
                        ? 'bg-[#E1F7EE] text-[#1D9E75] border-[#1D9E75]/30'
                        : p === 'estudante'
                        ? 'bg-[#E6EDFB] text-[#4068B2] border-[#4068B2]/30'
                        : 'bg-[#F2EFFC] text-[#6A47C9] border-[#6A47C9]/30'
                      : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                >
                  {p === 'medico' ? 'Médico' : p === 'estudante' ? 'Estudante' : 'Paciente'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">E-mail</label>
            <input 
              type="email" 
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
            disabled={isLoading}
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#0A865F] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading ? 'Entrando...' : 'Avançar'}
          </button>
          
        </form>

        <p className="text-center text-xs text-gray-400 pt-6">
          Autenticação Segura via Firebase
        </p>

      </motion.div>
    </div>
  );
};
