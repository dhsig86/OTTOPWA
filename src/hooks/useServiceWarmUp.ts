import { useEffect, useRef } from 'react';

/**
 * useServiceWarmUp — acorda todos os backends free-tier do ecossistema OTTO.
 *
 * Heroku e Render adormecem dynos/services após ~15min de inatividade.
 * Pingando imediatamente após o login, os servidores ficam quentes
 * quando o médico abre qualquer módulo (~30s de vantagem).
 *
 * Estratégia:
 *  - Pings em paralelo com fetch() fire-and-forget
 *  - Timeout de 30s por endpoint (AbortSignal.timeout)
 *  - Erros silenciados — warm-up nunca deve bloquear a UX
 *  - fired.current garante que só rode UMA vez por sessão
 */

export const WAKE_ENDPOINTS: { url: string; label: string }[] = [
  // ── Heroku ───────────────────────────────────────────────────────────────
  {
    url: 'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/health',
    label: 'OTTO Triagem',
  },
  // ── Render ───────────────────────────────────────────────────────────────
  {
    url: 'https://otto-protto.onrender.com/health',
    label: 'OTTO PROTTO API',
  },
  {
    url: 'https://otto-ocr-api.onrender.com/health',
    label: 'OTTO OCR',
  },
  // ── HuggingFace Space ────────────────────────────────────────────────────
  {
    url: 'https://OtoAi-bottok-orl-api.hf.space/status',
    label: 'BOTTOK (HuggingFace)',
  },
  // ── Render (Whisper) ────────────────────────────────────────────────────
  {
    url: 'https://otto-whisper.onrender.com/health',
    label: 'OTTO Whisper API',
  },
];

/** Dispara pings fire-and-forget em todos os backends. Seguro para chamar a qualquer momento. */
export function fireWarmUpPings(): void {
  const controller = (timeout: number) => {
    if (typeof AbortSignal?.timeout === 'function') {
      return { signal: AbortSignal.timeout(timeout) };
    }
    return {};
  };

  WAKE_ENDPOINTS.forEach(({ url, label }) => {
    fetch(url, { method: 'GET', ...controller(30_000) })
      .then(() => console.debug(`[WarmUp] ✓ ${label}`))
      .catch(() => console.debug(`[WarmUp] ⚠ ${label} ainda dormindo`));
  });
}

/** Hook React — garante que o warm-up rode apenas UMA vez por sessão (via WarmUpSplash). */
export function useServiceWarmUp() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fireWarmUpPings();
  }, []);
}
