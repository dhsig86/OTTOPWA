import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Inicialização segura do Sentry para telemetria de erros em runtime
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN && SENTRY_DSN.trim() !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.2, // amostra 20% das transações para telemetria de performance
    replaysSessionSampleRate: 0.1, // captura 10% das sessões normais
    replaysOnErrorSampleRate: 1.0, // captura 100% das sessões com erros de runtime
    environment: import.meta.env.MODE || 'production',
  });
  console.log('[Sentry] Telemetria inicializada com sucesso.');
} else {
  console.log('[Sentry] Inicialização ignorada (VITE_SENTRY_DSN ausente ou vazio).');
}

// Listener global para capturar falhas de importação de chunks ou erros de carregamento de assets (CSS/JS)
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  const isElementError = target && (target.tagName === 'LINK' || target.tagName === 'SCRIPT');
  const isChunkError = event.message && (
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.toLowerCase().includes('chunk') ||
    event.message.toLowerCase().includes('mime type')
  );

  if (isElementError || isChunkError) {
    console.warn('Erro de carregamento de asset estático detectado globalmente. Forçando recarregamento...');
    
    // Reportar erro do chunk ao Sentry se disponível
    if (SENTRY_DSN) {
      Sentry.captureMessage(`Static asset loading error: ${event.message || 'Chunk load failed'}`, 'warning');
    }

    const lastReload = sessionStorage.getItem('otto_chunk_reload');
    const now = Date.now();
    
    // Evita loops infinitos de reload (espera pelo menos 15 segundos entre tentativas)
    if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
      sessionStorage.setItem('otto_chunk_reload', now.toString());
      window.location.reload();
    }
  }
}, true); // useCapture = true para interceptar erros do DOM que não se propagam por bolha

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

