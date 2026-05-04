import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';
import { OTTO_MODULES } from '../config/modules';

export const ModuleFrame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, profile, firebaseToken } = useAuth();
  const { patientId, doctorId } = usePatient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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

    const timer = setTimeout(() => setShowFallback(true), 12000);
    return () => clearTimeout(timer);
  }, [targetUrl, navigate]);

  if (!targetUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Módulo não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#1D9E75]">Voltar</button>
      </div>
    );
  }

  const getSafeOrigin = () => {
    try { return new URL(targetUrl).origin; } catch { return '*'; }
  };

  const sendContext = (token = firebaseToken) => {
    const payload = {
      type: 'otto-context',
      payload: { userId, userName, profile, patientId, doctorId, firebaseToken: token }
    };
    iframeRef.current?.contentWindow?.postMessage(payload, getSafeOrigin());
  };

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
  }, [firebaseToken, userId, userName, profile, patientId, doctorId, targetUrl]);

  // Navega para outro módulo quando um iframe filho solicita via postMessage
  useEffect(() => {
    const handleNavigate = (event: MessageEvent) => {
      if (event.data?.type !== 'otto-navigate') return;
      const url = event.data?.url;
      if (typeof url === 'string' && url.startsWith('http')) {
        navigate('/modules/webview', { state: { url } });
      }
    };
    window.addEventListener('message', handleNavigate);
    return () => window.removeEventListener('message', handleNavigate);
  }, [navigate]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Reenviamos o contexto até 3 vezes com intervalo de 2s.
    // Isso garante que o Cases receba mesmo que a SPA ainda não tenha montado
    // o addEventListener('message') no momento exato do onLoad.
    sendContext();
    const t1 = setTimeout(() => sendContext(), 2000);
    const t2 = setTimeout(() => sendContext(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="h-14 bg-[#1D9E75] text-white flex items-center px-2 shrink-0 shadow-sm relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 mr-2 hover:bg-[#0A865F] rounded-full transition flex items-center gap-1"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
      </header>
      <div className="flex-1 w-full bg-gray-50 relative flex flex-col items-center justify-center">
        {isLoading && !showFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
            <Loader2 className="w-8 h-8 text-[#1D9E75] animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium tracking-wide">Conectando módulo...</p>
          </div>
        )}
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
