import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Tradução dos códigos de erro Firebase → Português
const firebaseError = (code: string, isRegistering: boolean): string => {
  const map: Record<string, string> = {
    'auth/user-not-found':             'E-mail não cadastrado. Crie uma conta primeiro.',
    'auth/wrong-password':             'Senha incorreta. Tente novamente.',
    'auth/invalid-credential':         'E-mail ou senha inválidos.',
    'auth/invalid-email':              'E-mail inválido.',
    'auth/user-disabled':              'Esta conta foi desabilitada. Contate o administrador.',
    'auth/email-already-in-use':       'Este e-mail já está cadastrado. Faça login.',
    'auth/weak-password':              'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/operation-not-allowed':      'Este método de login não está habilitado. Contate o administrador.',
    'auth/admin-restricted-operation': 'Cadastro de novos usuários está desabilitado no momento.',
    'auth/network-request-failed':     'Falha de rede. Verifique sua conexão.',
    'auth/too-many-requests':          'Muitas tentativas. Aguarde alguns minutos.',
    'auth/popup-blocked':              'Popup bloqueado. Tente novamente.',
    'auth/popup-closed-by-user':       'Login cancelado.',
    'auth/cancelled-popup-request':    'Login cancelado.',
    'auth/unauthorized-domain':        'Domínio não autorizado no Firebase. Contate o administrador.',
    'auth/requires-recent-login':      'Por segurança, faça login novamente.',
  };
  return map[code] || (isRegistering
    ? `Erro ao criar conta. (${code})`
    : `Falha no login. (${code})`);
};

export const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<'medico' | 'estudante' | 'profissional' | 'paciente'>('medico');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Redireciona automaticamente se já autenticado (ex: sessão ainda ativa)
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier || !password) return;

    setIsLoading(true);
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, identifier.trim(), password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, identifier.trim(), password);
      }
      const user = userCredential.user;
      const token = await user.getIdToken();
      login(user.uid, user.email || 'Usuário', selectedProfile, token);
      navigate('/');
    } catch (error: any) {
      console.error('Email auth error:', error);
      setErrorMsg(firebaseError(error.code || '', isRegistering));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');
    setResetMessage('');
    if (!identifier) {
      setErrorMsg('Digite seu e-mail acima para redefinir a senha.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, identifier.trim());
      setResetMessage('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrorMsg(firebaseError(error.code || '', false));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // signInWithPopup: resolve imediatamente sem cross-origin redirect.
      // Funciona porque vercel.json já tem Cross-Origin-Opener-Policy: same-origin-allow-popups.
      // signInWithRedirect falhava porque authDomain (otto-ecosystem.firebaseapp.com)
      // é diferente do domínio do app (otto.drdariohart.com), bloqueando a leitura
      // cross-origin do IndexedDB quando o Google redirecionava de volta.
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      login(user.uid, user.displayName || user.email || 'Usuário', selectedProfile, token);
      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      setErrorMsg(firebaseError(error.code || '', false));
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
            <div className="grid grid-cols-2 gap-2 w-full">
              {([
                { key: 'medico',       label: 'Médico',          active: 'bg-[#E1F7EE] text-[#1D9E75] border-[#1D9E75]/30' },
                { key: 'estudante',    label: 'Estudante',       active: 'bg-[#E6EDFB] text-[#4068B2] border-[#4068B2]/30' },
                { key: 'profissional', label: 'Prof. de Saúde',  active: 'bg-[#E0F5F0] text-[#0F766E] border-[#0F766E]/30' },
                { key: 'paciente',     label: 'Paciente',        active: 'bg-[#F2EFFC] text-[#6A47C9] border-[#6A47C9]/30' },
              ] as const).map(({ key, label, active }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedProfile(key)}
                  className={`py-2 px-2 rounded-full text-sm font-bold transition-all border ${
                    selectedProfile === key ? active : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                >
                  {label}
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

          {resetMessage && (
            <p className="text-[#1D9E75] text-xs font-semibold text-center">{resetMessage}</p>
          )}

          {!isRegistering && (
            <div className="flex justify-between items-center -mt-2">
              <span className="text-xs text-gray-400">Problemas para acessar?</span>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="text-xs text-[#1D9E75] hover:text-[#0A865F] font-bold transition-colors underline decoration-[#1D9E75]/30 hover:decoration-[#1D9E75] underline-offset-2 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Redefinir Senha
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#0A865F] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Avançar')}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">OU</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
              setResetMessage('');
            }}
            className="w-full text-center text-sm text-gray-500 hover:text-[#1D9E75] font-semibold mt-4 transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Entrar agora.' : 'Não possui acesso? Criar Conta.'}
          </button>
          
        </form>

        <p className="text-center text-xs text-gray-400 pt-6">
          Autenticação Segura via Firebase
        </p>

      </motion.div>
    </div>
  );
};
