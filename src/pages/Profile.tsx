import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Pencil, MapPin, Phone, Stethoscope, BadgeCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileData {
  cidade?: string;
  estado?: string;
  telefone?: string;
  crm?: string;
  crmUF?: string;
  conselho?: string;
  registroNumero?: string;
  registroUF?: string;
  sexo?: string;
}

export const Profile: React.FC = () => {
  const { userId, userName, profile, isPremium, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [extra, setExtra] = useState<ProfileData>({});

  // Load extended profile data from Firestore
  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'users', userId))
      .then(snap => { if (snap.exists()) setExtra(snap.data() as ProfileData); })
      .catch(() => {});
  }, [userId]);

  const handleLogout = () => {
    setConfirmingLogout(false);
    setLoggingOut(true);
    // Navega para login e faz logout após a animação "Até logo" terminar
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1800);
  };

  const getInitials = (name: string) => {
    if (!name) return 'US';
    const parts = name.replace(/^Dr\.?\s*/i, '').split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const profileLabels: Record<string, string> = {
    medico:       'Médico',
    estudante:    'Estudante / Residente',
    profissional: 'Profissional de Saúde',
    paciente:     'Paciente',
  };
  const profileLabel = profile ? (profileLabels[profile] ?? 'Usuário') : 'Usuário';

  const profileColors: Record<string, { bg: string; text: string }> = {
    medico:       { bg: 'bg-[#E1F7EE]', text: 'text-[#1D9E75]' },
    estudante:    { bg: 'bg-[#E6EDFB]', text: 'text-[#4068B2]' },
    profissional: { bg: 'bg-[#E0F5F0]', text: 'text-[#0F766E]' },
    paciente:     { bg: 'bg-[#F2EFFC]', text: 'text-[#6A47C9]' },
  };
  const { bg, text } = profileColors[profile ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };

  return (
    <div className="p-4 pb-24 max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5 mt-4"
      >
        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center gap-2 pt-4 pb-2">
          <div className={`w-20 h-20 rounded-full ${bg} ${text} flex items-center justify-center text-2xl font-extrabold shadow-sm`}>
            {getInitials(userName || '')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mt-1">{userName || 'Usuário'}</h2>
            <p className={`text-sm font-semibold mt-0.5 ${text}`}>{profileLabel}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-[#EF9F27] text-white text-xs font-bold rounded-full shadow-sm">
                <BadgeCheck size={12} /> OTTO PRO
              </span>
            )}
          </div>
        </div>

        {/* Profile details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">

          {/* Location */}
          {(extra.cidade || extra.estado) && (
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">
                {[extra.cidade, extra.estado].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Phone */}
          {extra.telefone && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">+55 {extra.telefone}</span>
            </div>
          )}

          {/* CRM (médico) */}
          {extra.crm && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Stethoscope size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">
                CRM {extra.crm} — {extra.crmUF}
              </span>
            </div>
          )}

          {/* Council registration (profissional) */}
          {extra.conselho && extra.registroNumero && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Stethoscope size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">
                {extra.conselho} {extra.registroNumero}
                {extra.registroUF ? ` — ${extra.registroUF}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Edit profile button */}
        <button
          onClick={() => navigate('/complete-profile')}
          className="w-full flex items-center justify-center gap-2 h-11 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
        >
          <Pencil size={15} />
          Editar Cadastro
        </button>

        {/* Logout */}
        <div className="pt-1">
          {!confirmingLogout ? (
            <button
              onClick={() => setConfirmingLogout(true)}
              className="w-full flex items-center justify-center gap-2 h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors text-sm"
            >
              <LogOut size={15} />
              Encerrar Sessão
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 font-medium">Confirma a saída da sua sessão?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="flex-1 h-11 bg-gray-100 text-gray-600 font-semibold rounded-xl active:scale-95 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                >
                  Sair
                </button>
              </div>
