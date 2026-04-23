import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const { userName, profile, isPremium, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'US';
    const parts = name.replace(/^Dr\.?\s*/i, '').split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getProfileLabel = () => {
    switch (profile) {
      case 'medico':       return 'Médico Otorrinolaringologista';
      case 'estudante':    return 'Estudante / Residente';
      case 'profissional': return 'Profissional de Saúde';
      case 'paciente':     return 'Paciente';
      default:             return 'Usuário Convidado';
    }
  };

  return (
    <div className="flex flex-col min-h-[60vh] p-4 text-center items-center pt-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="w-24 h-24 rounded-full bg-[#E1F7EE] text-[#1D9E75] flex items-center justify-center text-3xl font-extrabold mx-auto shadow-sm">
          {getInitials(userName || '')}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{userName || 'Usuário Beta'}</h2>
          <p className="text-gray-500 font-medium mt-1">{getProfileLabel()}</p>
          {isPremium && (
            <span className="inline-block mt-3 px-3 py-1 bg-[#EF9F27] text-white text-xs font-bold rounded-full shadow-sm">OTTO PRO</span>
          )}
        </div>

        <div className="pt-8">
          {!confirmingLogout ? (
            <button 
              onClick={() => setConfirmingLogout(true)}
              className="w-full flex items-center justify-center gap-2 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Encerrar Sessão
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 font-medium mb-3">Confirma a saída da sua sessão?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="flex-1 h-11 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-all"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
