import { useEffect, useRef } from 'react';

// Free-tier services (Render / Heroku) that hibernate after inactivity.
// Pinging them right after login gives the servers a ~30s head start so they
// are already warm when the user opens the module.
const WAKE_ENDPOINTS = [
  'https://otto-ocr-api.onrender.com/health',
  'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/health',
];

export function useServiceWarmUp() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    WAKE_ENDPOINTS.forEach((url) => {
      fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout ? AbortSignal.timeout(25000) : undefined,
      }).catch(() => {/* silently ignore — warm-up only */});
    });
  }, []);
}
