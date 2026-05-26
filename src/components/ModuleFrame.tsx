import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';
import { OTTO_MODULES } from '../config/modules';
import { trackModuleOpened } from '../lib/analytics';
import { ModuleSplash } from './ModuleSplash';
import { AnimatePresence } from 'framer-motion';

export const ModuleFrame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, profile, firebaseToken } = useAuth();
  const { patientId, doctorId } = usePatient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [splashMinDone, setSplashMinDone] = useState(false); // tempo mínimo de leitura
  const iframeLoadedRef = useRef(false);

  // Tempo mínimo garantido de exibição do splash (ms)
  const MIN_SPLASH_MS = 2500;
  
  const state = location.state as { url?: string };
  const targetUrl = state?.url;

  useEffect(() => {
    if (!targetUrl) return;

    const moduleInfo = OTTO_MODULES.find(m => m.url === targetUrl);
    if (moduleInfo?.iframeBlocked) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      navigate(-1);
      return;
    }

    // Fallback de segurança após 30s (permite acordar backends em cold start no Render)
    const timer = setTimeout(() => setShowFallback(true), 30000);

    // Tempo mínimo de splash: só libera após MIN_SPLASH_MS
    const minTimer = setTimeout(() => {
      setSplashMinDone(true);
      // Se o iframe já tinha carregado, fecha o splash agora
      if (iframeLoadedRef.current) setIsLoading(false);
    }, MIN_SPLASH_MS);

    return () => { clearTimeout(timer); clearTimeout(minTimer); };
  }, [targetUrl, navigate]);



  const getSafeOrigin = () => {
    try { return new URL(targetUrl || '').origin; } catch { return '*'; }
  };

  const sendContext = useCallback((token = firebaseToken) => {
    const payload = {
      type: 'otto-context',
      payload: { userId, userName, profile, patientId, doctorId, firebaseToken: token }
    };
    iframeRef.current?.contentWindow?.postMessage(payload, getSafeOrigin());

    // Check for pending text injection
    const pendingText = sessionStorage.getItem('otto_pending_injection');
    if (pendingText) {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'otto-receive-injection',
        text: pendingText
      }, getSafeOrigin());
      sessionStorage.removeItem('otto_pending_injection');
    }

    // Check for pending concierge postMessage payload
    const pendingConciergeMessage = sessionStorage.getItem('otto_concierge_pending_message');
    if (pendingConciergeMessage) {
      try {
        const parsed = JSON.parse(pendingConciergeMessage);
        iframeRef.current?.contentWindow?.postMessage(parsed, getSafeOrigin());
        sessionStorage.removeItem('otto_concierge_pending_message');
      } catch (e) {
        console.error('Failed to parse pending concierge message', e);
      }
    }
  }, [firebaseToken, userId, userName, profile, patientId, doctorId, targetUrl]);

  // Responde ao módulo quando ele pede renovação de token (401 recovery)
  useEffect(() => {
    const handleRefreshRequest = async (event: MessageEvent) => {
      if (event.data?.type !== 'otto-request-refresh') return;
      try {
        const { auth: firebaseAuth } = await import('../lib/firebase');
        const freshToken = await firebaseAuth.currentUser?.getIdToken(true) ?? firebaseToken;
        sendContext(freshToken);
      } catch {
        sendContext();
      }
    };
    window.addEventListener('message', handleRefreshRequest);
    return () => window.removeEventListener('message', handleRefreshRequest);
  }, [sendContext]);

  // Navega para outro módulo quando um iframe filho solicita via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 1. Navegação Simples
      if (event.data?.type === 'otto-navigate') {
        const url = event.data?.url;
        if (typeof url === 'string' && url.startsWith('http')) {
          navigate('/modules/webview', { state: { url } });
        }
      } 
      // 2. Injeção de Texto no PROTTO (WHISPER -> PWA -> PROTTO)
      else if (event.data?.type === 'otto-inject-protto') {
        const text = event.data?.text;
        if (text) {
          sessionStorage.setItem('otto_pending_injection', text);
          const prottoUrl = OTTO_MODULES.find(m => m.id === 'protto')?.url;
          if (prottoUrl) {
            navigate('/modules/webview', { state: { url: prottoUrl } });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true; // marca que o iframe já carregou

    // Só fecha o splash se o tempo mínimo já passou
    // Caso contrário, o minTimer vai fechar quando expirar
    if (splashMinDone) {
      setIsLoading(false);
    }

    // PRODUCT-01: Registra abertura de módulo para análise de engajamento

    const moduleInfo = OTTO_MODULES.find(m => m.url === targetUrl);
    if (moduleInfo) {
      trackModuleOpened(moduleInfo.id, moduleInfo.name, profile ?? null);
    }

    // Reenviamos o contexto até 3 vezes com intervalo de 2s.
    // Isso garante que o Cases receba mesmo que a SPA ainda não tenha montado
    // o addEventListener('message') no momento exato do onLoad.
    sendContext();
    const t1 = setTimeout(() => sendContext(), 2000);
    const t2 = setTimeout(() => sendContext(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  };

  if (!targetUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Módulo não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#1D9E75]">Voltar</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center justify-between px-3 shrink-0 shadow-sm relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#0A865F] rounded-full transition flex items-center gap-1"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <a 
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-[#0A865F] rounded-lg transition flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white"
        >
          <ExternalLink size={16} />
          <span>Abrir em Nova Aba</span>
        </a>
      </header>
      <div className="flex-1 w-full bg-gray-50 relative flex flex-col items-center justify-center">
        <AnimatePresence>
          {isLoading && !showFallback && (
            <ModuleSplash 
              key="splash"
              moduleId={OTTO_MODULES.find(m => m.url === targetUrl)?.id} 
              moduleName={OTTO_MODULES.find(m => m.url === targetUrl)?.name} 
            />
          )}
        </AnimatePresence>
        {showFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-0 p-6 text-center space-y-4">
            <p className="text-sm text-gray-500 font-medium max-w-xs">
              Módulo demorando para responder? Pode haver um bloqueio de segurança na rede.
            </p>
            <a 
              href={targetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <ExternalLink size={18} />
              Abrir em Nova Aba
            </a>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={targetUrl}
          onLoad={handleIframeLoad}
          className="absolute inset-0 w-full h-full border-0 z-10 bg-transparent"
          title="Módulo Externo"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals"
          allow="camera; microphone; fullscreen; autoplay; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
