import React, { useEffect, useState } from 'react';

// Serviços monitorados durante o aquecimento
const SERVICES = [
  { label: 'OTTO Triagem',   url: 'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/health' },
  { label: 'OTTO PROTTO',    url: 'https://otto-protto.onrender.com/health' },
  { label: 'OTTO OCR',       url: 'https://otto-ocr-api.onrender.com/health' },
  { label: 'BOTTOK',         url: 'https://OtoAi-bottok-orl-api.hf.space/status' },
];

// Tempo mínimo de exibição (ms) — garante que o usuário veja a tela mesmo se tudo acordar rápido
const MIN_DISPLAY_MS = 4000;
// Tempo máximo antes de avançar mesmo com serviços ainda dormindo
const MAX_DISPLAY_MS = 18000;
// Timeout por ping individual
const PING_TIMEOUT_MS = 15000;

type ServiceStatus = 'pending' | 'ok' | 'slow';

interface ServiceState {
  label: string;
  status: ServiceStatus;
}

interface WarmUpSplashProps {
  onReady: () => void;
}

export const WarmUpSplash: React.FC<WarmUpSplashProps> = ({ onReady }) => {
  const [services, setServices] = useState<ServiceState[]>(
    SERVICES.map(s => ({ label: s.label, status: 'pending' }))
  );
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animar reticências
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  // Barra de progresso suave (independente dos pings)
  useEffect(() => {
    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Progresso sobe até 95% ao longo do MAX_DISPLAY_MS, o 100% só vem quando pronto
      setProgress(Math.min(95, (elapsed / MAX_DISPLAY_MS) * 100));
    }, 200);
    return () => clearInterval(tick);
  }, []);

  // Pinga todos os serviços e avança quando terminar ou timeout
  useEffect(() => {
    const startTime = Date.now();
    let resolved = false;

    const tryAdvance = () => {
      if (resolved) return;
      const elapsed = Date.now() - startTime;
      if (elapsed >= MIN_DISPLAY_MS) {
        resolved = true;
        setProgress(100);
        setTimeout(onReady, 300); // pequena pausa para o 100% aparecer
      } else {
        setTimeout(() => {
          resolved = true;
          setProgress(100);
          setTimeout(onReady, 300);
        }, MIN_DISPLAY_MS - elapsed);
      }
    };

    // Máximo absoluto
    const maxTimer = setTimeout(() => {
      if (!resolved) tryAdvance();
    }, MAX_DISPLAY_MS);

    // Ping cada serviço
    const pingPromises = SERVICES.map((svc, idx) =>
      fetch(svc.url, {
        method: 'GET',
        signal: AbortSignal.timeout ? AbortSignal.timeout(PING_TIMEOUT_MS) : undefined,
      })
        .then(() => {
          setServices(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], status: 'ok' };
            return next;
          });
        })
        .catch(() => {
          setServices(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], status: 'slow' };
            return next;
          });
        })
    );

    // Quando TODOS os pings terminarem (ok ou slow), pode avançar
    Promise.allSettled(pingPromises).then(tryAdvance);

    return () => clearTimeout(maxTimer);
  }, [onReady]);

  const readyCount = services.filter(s => s.status !== 'pending').length;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f1923 0%, #0d2b22 50%, #071a14 100%)',
      }}
    >
      {/* Logo / Pulse */}
      <div className="relative mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(29,158,117,0.15)', border: '2px solid rgba(29,158,117,0.3)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: 'rgba(29,158,117,0.25)' }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M4 18 Q8 8 14 18 Q18 26 22 14 Q26 4 32 18"
                stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" fill="none"
              />
            </svg>
          </div>
        </div>
        {/* Anel pulsante externo */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ border: '1px solid rgba(29,158,117,0.2)', animationDuration: '2s' }}
        />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
        HART's OTTO Ecosystem
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(29,158,117,0.8)' }}>
        Preparando módulos clínicos{dots}
      </p>

      {/* Lista de serviços */}
      <div className="w-72 space-y-2 mb-8">
        {services.map(svc => (
          <div key={svc.label} className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="text-xs text-gray-300">{svc.label}</span>
            <span className="text-xs font-medium">
              {svc.status === 'pending' && (
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>aguardando</span>
              )}
              {svc.status === 'ok' && (
                <span style={{ color: '#1D9E75' }}>✓ ativo</span>
              )}
              {svc.status === 'slow' && (
                <span style={{ color: '#f59e0b' }}>⚡ iniciando</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="w-72 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #1D9E75, #34d399)',
          }}
        />
      </div>

      <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {readyCount}/{services.length} serviços responderam
      </p>
    </div>
  );
};
