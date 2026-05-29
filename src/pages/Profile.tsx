import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Pencil, MapPin, Phone, Stethoscope, BadgeCheck, Mail,
  Calendar, ShieldCheck, Download, Trash2, User, X, Check, ChevronDown,
  Info, ExternalLink, Loader2
} from 'lucide-react';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import packageJson from '../../package.json';

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const CONSELHOS = [
  'CRFa (Fonoaudiologia)', 'CREFITO (Fisioterapia)',
  'COFEN / COREN (Enfermagem)', 'CRO (Odontologia)',
  'CRP (Psicologia)', 'CRN (Nutrição)',
  'COFFITO (Terapia Ocupacional)', 'Outro',
];

interface ProfileData {
  displayName?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  crm?: string;
  crmUF?: string;
  conselho?: string;
  registroNumero?: string;
  registroUF?: string;
  sexo?: string;
  dataNascimento?: string;
  profile?: string;
}

// ─── Toast notification ─────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
      type === 'success' ? 'bg-[#1D9E75] text-white' : 'bg-red-500 text-white'
    }`}
  >
    {type === 'success' ? <Check size={16} /> : <X size={16} />}
    {message}
    <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
  </motion.div>
);

// ─── Inline editable field ──────────────────────────────────────────────────
const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#CDF0E3] transition-all outline-none text-sm text-gray-800";
const selectClass = `${inputClass} appearance-none cursor-pointer`;

export const Profile: React.FC = () => {
  const { userId, userName, userEmail, createdAt, profile, isPremium, subscriptionPlan, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [extra, setExtra] = useState<ProfileData>({});
  const [editForm, setEditForm] = useState<ProfileData>({});

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'users', userId))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data() as ProfileData;
          setExtra(d);
          setEditForm(d);
        }
      })
      .catch(() => {});
  }, [userId]);

  // ─── Toast auto-dismiss ────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setConfirmingLogout(false);
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1800);
  };

  const handleStartEdit = () => {
    setEditForm({ ...extra });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...extra });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        displayName: editForm.displayName?.trim() || userName || '',
        telefone: editForm.telefone?.trim() || '',
        cidade: editForm.cidade?.trim() || '',
        estado: editForm.estado || '',
        sexo: editForm.sexo || null,
        dataNascimento: editForm.dataNascimento || null,
        updatedAt: serverTimestamp(),
      };

      // Campos condicionais por perfil
      if (profile === 'medico') {
        payload.crm = editForm.crm?.trim() || '';
        payload.crmUF = editForm.crmUF || '';
      }
      if (profile === 'profissional') {
        payload.conselho = editForm.conselho || '';
        payload.registroNumero = editForm.registroNumero?.trim() || '';
        payload.registroUF = editForm.registroUF || '';
      }

      await setDoc(doc(db, 'users', userId), payload, { merge: true });

      // Update local state
      setExtra(prev => ({ ...prev, ...payload }));
      setIsEditing(false);
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' });

      // Sync localStorage for name
      if (payload.displayName) {
        localStorage.setItem('otto_user_name', payload.displayName);
      }
    } catch (err) {
      console.error('Save error:', err);
      setToast({ message: 'Erro ao salvar. Tente novamente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (field: keyof ProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setEditForm(prev => ({ ...prev, [field]: e.target.value }));

  // ─── LGPD: Export all data ──────────────────────────────────────────────────
  const handleDownloadData = useCallback(async () => {
    if (!userId) return;
    setIsExporting(true);
    try {
      // 1. Auth + Profile data
      const profileSnap = await getDoc(doc(db, 'users', userId));
      const profileData = profileSnap.exists() ? profileSnap.data() : {};

      // 2. Prontuários livres (PROTTO)
      let consultas: any[] = [];
      try {
        const consultasSnap = await getDocs(collection(db, 'prontuarios_livres', userId, 'consultas'));
        consultas = consultasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch { /* collection may not exist */ }

      // 3. Logbook entries (by owner)
      let logbookEntries: any[] = [];
      try {
        const logSnap = await getDocs(collection(db, 'logbooks'));
        logbookEntries = logSnap.docs
          .filter(d => d.data().userId === userId || d.data().doctorId === userId)
          .map(d => ({ id: d.id, ...d.data() }));
      } catch { /* collection may not exist */ }

      const dataToExport = {
        _meta: {
          exportedAt: new Date().toISOString(),
          exportVersion: '2.0',
          platform: 'OTTO Ecosystem',
          userId: userId,
        },
        autenticacao: {
          uid: userId,
          name: userName,
          email: userEmail,
          createdAt: createdAt,
          profile: profile,
          isPremium: isPremium,
          plan: subscriptionPlan,
        },
        perfilCompleto: profileData,
        prontuarios: consultas,
        logbookCirurgico: logbookEntries,
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `otto_dados_completos_${userName?.replace(/\s+/g, '_').toLowerCase() || 'usuario'}_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: 'Dados exportados com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ message: 'Erro ao exportar dados.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [userId, userName, userEmail, createdAt, profile, isPremium, subscriptionPlan]);

  const handleDeleteAccount = async () => {
    try {
      setConfirmingDelete(false);
      setLoggingOut(true);
      await deleteAccount();
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setLoggingOut(false);
      alert('Não foi possível excluir a conta. Para sua segurança, faça logout, faça login novamente e tente excluir a conta em seguida.');
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return 'US';
    const parts = name.replace(/^Dr\.?\s*/i, '').split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const profileLabels: Record<string, string> = {
    medico: 'Médico', estudante: 'Estudante / Residente',
    profissional: 'Profissional de Saúde', paciente: 'Paciente',
  };
  const profileLabel = profile ? (profileLabels[profile] ?? 'Usuário') : 'Usuário';

  const profileColors: Record<string, { bg: string; text: string }> = {
    medico:       { bg: 'bg-[#E1F7EE]', text: 'text-[#1D9E75]' },
    estudante:    { bg: 'bg-[#E6EDFB]', text: 'text-[#4068B2]' },
    profissional: { bg: 'bg-[#E0F5F0]', text: 'text-[#0F766E]' },
    paciente:     { bg: 'bg-[#F2EFFC]', text: 'text-[#6A47C9]' },
  };
  const { bg, text } = profileColors[profile ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };

  const displayName = (isEditing ? editForm.displayName : extra.displayName) || userName || 'Usuário';

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
            {getInitials(displayName)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mt-1">{displayName}</h2>
            <p className={`text-sm font-semibold mt-0.5 ${text}`}>{profileLabel}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-[#EF9F27] text-white text-xs font-bold rounded-full shadow-sm">
                <BadgeCheck size={12} /> OTTO PRO
              </span>
            )}
          </div>
        </div>

        {/* ─── VIEW MODE ─────────────────────────────────────────────────────── */}
        {!isEditing && (
          <>
            {/* Profile details card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {(extra.cidade || extra.estado) && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <MapPin size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {[extra.cidade, extra.estado].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}

              {extra.telefone && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">+55 {extra.telefone}</span>
                </div>
              )}

              {extra.crm && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Stethoscope size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">
                    CRM {extra.crm} — {extra.crmUF}
                  </span>
                </div>
              )}

              {extra.conselho && extra.registroNumero && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Stethoscope size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {extra.conselho} {extra.registroNumero}
                    {extra.registroUF ? ` — ${extra.registroUF}` : ''}
                  </span>
                </div>
              )}

              {extra.sexo && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <User size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 capitalize">{extra.sexo === 'nao_informar' ? 'Não informado' : extra.sexo}</span>
                </div>
              )}
            </div>

            {/* Edit profile button */}
            <button
              onClick={handleStartEdit}
              className="w-full flex items-center justify-center gap-2 h-11 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
            >
              <Pencil size={15} />
              Editar Perfil
            </button>
          </>
        )}

        {/* ─── EDIT MODE ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-[#1D9E75]/20 shadow-sm p-4 space-y-4">
                <h3 className="text-xs font-bold text-[#1D9E75] uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil size={12} /> Editar Dados
                </h3>

                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={editForm.displayName || ''}
                    onChange={setField('displayName')}
                    placeholder="Ex: Dr. Dario Hart Signorini"
                    className={inputClass}
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none">+55</span>
                    <input
                      type="tel"
                      value={editForm.telefone || ''}
                      onChange={setField('telefone')}
                      placeholder="(11) 99999-9999"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Estado + Cidade */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</label>
                    <div className="relative">
                      <select value={editForm.estado || ''} onChange={setField('estado')} className={selectClass}>
                        <option value="">UF</option>
                        {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade</label>
                    <input
                      type="text"
                      value={editForm.cidade || ''}
                      onChange={setField('cidade')}
                      placeholder="Ex: São Paulo"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Sexo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sexo</label>
                  <div className="relative">
                    <select value={editForm.sexo || ''} onChange={setField('sexo')} className={selectClass}>
                      <option value="">Selecionar</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                      <option value="nao_informar">Prefiro não informar</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Data Nascimento */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editForm.dataNascimento || ''}
                    onChange={setField('dataNascimento')}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ── Campos condicionais: Médico ── */}
              {profile === 'medico' && (
                <div className="bg-[#E1F7EE] rounded-2xl p-4 space-y-3 border border-[#1D9E75]/20">
                  <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-wider">Registro Médico</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CRM</label>
                      <input
                        type="text"
                        value={editForm.crm || ''}
                        onChange={setField('crm')}
                        placeholder="123456"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">UF do CRM</label>
                      <div className="relative">
                        <select value={editForm.crmUF || ''} onChange={setField('crmUF')} className={selectClass}>
                          <option value="">UF</option>
                          {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Campos condicionais: Profissional ── */}
              {profile === 'profissional' && (
                <div className="bg-[#E0F5F0] rounded-2xl p-4 space-y-3 border border-[#0F766E]/20">
                  <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Registro Profissional</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conselho</label>
                      <div className="relative">
                        <select value={editForm.conselho || ''} onChange={setField('conselho')} className={selectClass}>
                          <option value="">Selecionar conselho</option>
                          {CONSELHOS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nº Registro</label>
                        <input
                          type="text"
                          value={editForm.registroNumero || ''}
                          onChange={setField('registroNumero')}
                          placeholder="12345"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">UF</label>
                        <div className="relative">
                          <select value={editForm.registroUF || ''} onChange={setField('registroUF')} className={selectClass}>
                            <option value="">UF</option>
                            {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  <X size={15} /> Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 h-11 bg-[#1D9E75] hover:bg-[#0A865F] disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Seção: Minha Conta ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
            <User size={12} />
            Minha Conta
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {userEmail && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{userEmail}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Calendar size={15} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">
                  Membro desde {new Date(createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <BadgeCheck size={15} className={isPremium ? 'text-[#EF9F27]' : 'text-gray-400'} />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">
                  Plano: <span className="font-semibold">{isPremium ? 'OTTO PRO' : 'Gratuito'}</span>
                </span>
                {subscriptionPlan && <span className="text-xs text-gray-400">{subscriptionPlan}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Seção: Privacidade e LGPD ───────────────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1.5 mt-4">
            <ShieldCheck size={12} />
            Privacidade e Segurança
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <button
              onClick={handleDownloadData}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
            >
              {isExporting
                ? <Loader2 size={15} className="text-blue-500 shrink-0 animate-spin" />
                : <Download size={15} className="text-blue-500 shrink-0" />
              }
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {isExporting ? 'Exportando...' : 'Baixar meus dados'}
                </span>
                <span className="text-xs text-gray-400">Exportar todos os dados em JSON (LGPD)</span>
              </div>
            </button>

            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 size={15} className="text-red-500 shrink-0" />
                <span className="text-sm font-medium text-red-600">Excluir minha conta</span>
              </button>
            ) : (
              <div className="p-4 bg-red-50 space-y-3">
                <p className="text-xs text-red-600 font-medium">Tem certeza? Esta ação é irreversível e apagará todos os seus dados.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 h-9 bg-white border border-red-200 text-gray-600 font-semibold rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 h-9 bg-red-500 text-white font-bold rounded-lg text-xs hover:bg-red-600"
                  >
                    Sim, excluir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Link para Termos de Uso */}
          <button
            onClick={() => navigate('/terms')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors text-left mt-2"
          >
            <ShieldCheck size={15} className="text-[#1D9E75] shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Termos de Uso e Disclaimer Clínico</span>
              <span className="text-xs text-gray-400">Política de uso, privacidade e responsabilidade</span>
            </div>
          </button>
        </div>

        {/* ─── Seção: Sobre o App ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1.5 mt-4">
            <Info size={12} />
            Sobre o App
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">Versão</span>
              <span className="text-sm font-mono text-gray-500">{packageJson.version}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">Plataforma</span>
              <span className="text-sm text-gray-500">OTTO Ecosystem</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">Idealizado e realizado por</span>
              <span className="text-sm font-semibold text-gray-600">Dr. Dario Hart Signorini</span>
            </div>
            <div className="px-4 py-2.5">
              <span className="text-[10px] text-gray-400 leading-relaxed">
                Otorrinolaringologista · Cirurgião de Cabeça e Pescoço
              </span>
            </div>
            <a
              href="mailto:dr.dhsig@gmail.com"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <Mail size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">dr.dhsig@gmail.com</span>
              <ExternalLink size={12} className="text-gray-300 ml-auto" />
            </a>
          </div>
        </div>

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
            </div>
          )}
        </div>

        <div className="text-center pt-4 pb-2">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck size={10} />
            Dados protegidos pela LGPD
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            OTTO Ecosystem v{packageJson.version} · Autenticação Firebase
          </p>
        </div>
      </motion.div>

      {/* Tela de despedida — aparece sobre tudo ao confirmar logout */}
      {loggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-5 text-center px-8"
          >
            <div className={`w-20 h-20 rounded-full ${profileColors[profile ?? '']?.bg ?? 'bg-gray-100'} ${profileColors[profile ?? '']?.text ?? 'text-gray-500'} flex items-center justify-center text-2xl font-extrabold shadow-sm`}>
              {getInitials(userName || '')}
            </div>

            <div>
              <p className="text-2xl font-extrabold text-gray-800">Até logo! 👋</p>
              <p className="text-gray-500 text-sm mt-1">
                {userName ? `Cuide-se, ${userName.split(' ')[0]}.` : 'Até a próxima.'}
              </p>
            </div>

            <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'linear' }}
                className="h-full bg-[#1D9E75] rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};
