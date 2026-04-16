import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

export const ModuleFrame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, profile } = useAuth();
  const { patientId, doctorId } = usePatient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const state = location.state as { url?: string };
  const targetUrl = state?.url;

  if (!targetUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Módulo não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#1D9E75]">Voltar</button>
      </div>
    );
  }

  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'otto-context',
        payload: { userId, userName, profile, patientId, doctorId }
      },
      '*' // Em produção idealmente restringido via targetUrl, mas '*' atende cross origin no momento.
    );
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
      <div className="flex-1 w-full bg-gray-50 relative">
        <iframe
          ref={iframeRef}
          src={targetUrl}
          onLoad={handleIframeLoad}
          className="absolute inset-0 w-full h-full border-0"
          title="Módulo Externo"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          allow="camera; microphone; fullscreen; autoplay"
        />
      </div>
    </div>
  );
};
