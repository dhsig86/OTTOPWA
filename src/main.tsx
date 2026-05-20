import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
