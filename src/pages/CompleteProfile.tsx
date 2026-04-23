import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, User, Mail, Phone, MapPin, Calendar, Stethoscope } from 'lucide-react';

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const CONSELHOS = [
  'CRFa (Fonoaudiologia)',
  'CREFITO (Fisioterapia)',
  'COFEN / COREN (Enfermagem)',
  'CRO (Odontologia)',
  'CRP (Psicologia)',
  'CRN (Nutrição)',
  'COFFITO (Terapia Ocupacional)',
  'Outro',
];

interface FormData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  estado: string;
  cidade: string;
  sexo: string;
  dataNascimento: string;
  tipoUsuario: string;
  // médico
  crm: string;
  crmUF: string;
  // profissional
  conselho: string;
  registroNumero: string;
  registroUF: string;
}

const INITIAL: FormData = {
  nomeCompleto: '', email: '', telefone: '', estado: '', cidade: '',
  sexo: '', dataNascimento: '', tipoUsuario: '',
  crm: '', crmUF: '', conselho: '', registroNumero: '', registroUF: '',
};

const InputField = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    {children}
  </div>
);

const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#CDF0E3] transition-all outline-none text-sm text-gray-800";
const selectClass = `${inputClass} appearance-none cursor-pointer`;

export const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userName, profile, markProfileCompleted } = useAuth();
  const [form, setForm] = useState<FormData>({
    ...INITIAL,
    nomeCompleto: userName || '',
    tipoUsuario: profile || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const isMedico      = form.tipoUsuario === 'medico';
  const isProfissional = form.tipoUsuario === 'profissional';

  const validate = (): string => {
    if (!form.nomeCompleto.trim()) return 'Nome completo é obrigatório.';
    if (!form.telefone.trim())    return 'Telefone é obrigatório.';
    if (!form.estado)             return 'Estado é obrigatório.';
    if (!form.cidade.trim())      return 'Cidade é obrigatória.';
    if (!form.tipoUsuario)        return 'Tipo de usuário é obrigatório.';
    if (isMedico && !form.crm.trim())        return 'CRM é obrigatório para médicos.';
    if (isMedico && !form.crmUF)             return 'UF do CRM é obrigatória.';
    if (isProfissional && !form.conselho)    return 'Conselho profissional é obrigatório.';
    if (isProfissional && !form.registroNumero.trim()) return 'Número de registro é obrigatório.';
    if (isProfissional && !form.registroUF)  return 'UF do registro é obrigatória.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    if (!userId) return;

    setIsLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', userId);
      const payload: Record<string, any> = {
        displayName:     form.nomeCompleto.trim(),
        email:           form.email.trim() || null,
        telefone:        form.telefone.trim(),
        estado:          form.estado,
        cidade:          form.cidade.trim(),
        sexo:            form.sexo || null,
        dataNascimento:  form.dataNascimento || null,
        profile:         form.tipoUsuario,
        profileCompleted: true,
        updatedAt:       serverTimestamp(),
      };

      if (isMedico) {
        payload.crm   = form.crm.trim();
        payload.crmUF = form.crmUF;
      }
      if (isProfissional) {
        payload.conselho       = form.conselho;
        payload.registroNumero = form.registroNumero.trim();
        payload.registroUF     = form.registroUF;
      }

      await setDoc(userRef, payload, { merge: true });
      markProfileCompleted(form.nomeCompleto.trim(), form.tipoUsuario as any);

      // Se primeiro acesso → onboarding, senão → home
      if (!localStorage.getItem('otto_onboarding_completed')) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1D9E75]/10 via-white to-white">
      {/* Header */}
      <div className="bg-[#1D9E75] text-white px-5 pt-12 pb-8 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User size={28} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Complete seu cadastro</h1>
        <p className="text-white/80 text-sm mt-1">Seus dados ficam seguros e só são usados para personalizar o OTTO</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto px-5 py-8 space-y-5"
      >
        {/* Nome */}
        <InputField label="Nome Completo *" icon={User}>
          <input
            type="text"
            placeholder="Ex: Dr. Dario Hart Signorini"
            value={form.nomeCompleto}
            onChange={set('nomeCompleto')}
            className={inputClass}
          />
        </InputField>

        {/* E-mail */}
        <InputField label="E-mail" icon={Mail}>
          <input
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={set('email')}
            className={inputClass}
          />
        </InputField>

        {/* Telefone */}
        <InputField label="Telefone *" icon={Phone}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium select-none">
              +55
            </span>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={set('telefone')}
              className={`${inputClass} pl-14`}
            />
          </div>
        </InputField>

        {/* Estado + Cidade */}
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Estado *" icon={MapPin}>
            <div className="relative">
              <select value={form.estado} onChange={set('estado')} className={selectClass}>
                <option value="">UF</option>
                {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </InputField>

          <InputField label="Cidade *">
            <input
              type="text"
              placeholder="Ex: São Paulo"
              value={form.cidade}
              onChange={set('cidade')}
              className={inputClass}
            />
          </InputField>
        </div>

        {/* Sexo + Data Nascimento */}
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Sexo">
            <div className="relative">
              <select value={form.sexo} onChange={set('sexo')} className={selectClass}>
                <option value="">Selecionar</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="nao_informar">Prefiro não informar</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </InputField>

          <InputField label="Data de Nascimento" icon={Calendar}>
            <input
              type="date"
              value={form.dataNascimento}
              onChange={set('dataNascimento')}
              className={inputClass}
            />
          </InputField>
        </div>

        {/* Tipo de Usuário */}
        <InputField label="Tipo de usuário *" icon={Stethoscope}>
          <div className="relative">
            <select value={form.tipoUsuario} onChange={set('tipoUsuario')} className={selectClass}>
              <option value="">Selecionar perfil</option>
              <option value="medico">Médico</option>
              <option value="estudante">Estudante / Residente</option>
              <option value="profissional">Prof. de Saúde (Fono, Fisio, Enf...)</option>
              <option value="paciente">Paciente</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </InputField>

        {/* ── Campos condicionais: Médico ── */}
        {isMedico && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#E1F7EE] rounded-2xl p-4 space-y-4 border border-[#1D9E75]/20"
          >
            <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-wider">Registro Médico</p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="CRM *">
                <input
                  type="text"
                  placeholder="Ex: 123456"
                  value={form.crm}
                  onChange={set('crm')}
                  className={inputClass}
                />
              </InputField>
              <InputField label="UF do CRM *">
                <div className="relative">
                  <select value={form.crmUF} onChange={set('crmUF')} className={selectClass}>
                    <option value="">UF</option>
                    {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </InputField>
            </div>
          </motion.div>
        )}

        {/* ── Campos condicionais: Profissional de Saúde ── */}
        {isProfissional && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#E0F5F0] rounded-2xl p-4 space-y-4 border border-[#0F766E]/20"
          >
            <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Registro Profissional</p>
            <InputField label="Conselho *">
              <div className="relative">
                <select value={form.conselho} onChange={set('conselho')} className={selectClass}>
                  <option value="">Selecionar conselho</option>
                  {CONSELHOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </InputField>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Número de Registro *">
                <input
                  type="text"
                  placeholder="Ex: 12345"
                  value={form.registroNumero}
                  onChange={set('registroNumero')}
                  className={inputClass}
                />
              </InputField>
              <InputField label="UF *">
                <div className="relative">
                  <select value={form.registroUF} onChange={set('registroUF')} className={selectClass}>
                    <option value="">UF</option>
                    {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </InputField>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="text-red-500 text-sm font-semibold text-center bg-red-50 rounded-xl py-3 px-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-[#1D9E75] hover:bg-[#0A865F] disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-[0.98] mt-4"
        >
          {isLoading ? 'Salvando...' : 'Salvar e continuar →'}
        </button>

        <p className="text-center text-xs text-gray-400 pb-8">
          Dados protegidos pela LGPD · Autenticação Firebase
        </p>
      </motion.form>
    </div>
  );
};
