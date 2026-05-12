/**
 * analytics.ts — PRODUCT-01: Instrumentação Firebase Analytics
 *
 * Helper centralizado para todos os logEvent do OTTO PWA.
 * Cada chamada é no-op seguro quando Analytics não está disponível (SSR, dev sem measurementId).
 *
 * Eventos chave para demonstrar crescimento e unit economics a investidores:
 *   module_opened        → qual módulo, qual perfil (DAU por módulo)
 *   onboarding_completed → funil de ativação
 *   subscription_upgraded → conversão free → premium
 *   calculator_used      → instrumento, área (engagement no CALC-HUB)
 *   intake_submitted     → casos iniciados com IA
 *   case_created         → casos salvos
 *   bottok_query         → perguntas ao BOTTOK
 *   profile_filter_changed → comportamento de exploração
 */

import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

type EventParams = Record<string, string | number | boolean | null | undefined>;

/** Wrapper seguro — nunca lança mesmo sem analytics inicializado */
function log(eventName: string, params?: EventParams) {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch {
    // Silencioso — analytics não deve quebrar a UI
  }
}

// ── Eventos de Módulo ──────────────────────────────────────────────────────

/** Dispara quando um módulo externo é aberto via ModuleFrame */
export function trackModuleOpened(moduleId: string, moduleName: string, profile: string | null) {
  log('module_opened', {
    module_id: moduleId,
    module_name: moduleName,
    user_profile: profile ?? 'unknown',
  });
}

/** Dispara quando o usuário troca o filtro de perfil na Home */
export function trackProfileFilterChanged(toProfile: string) {
  log('profile_filter_changed', { to_profile: toProfile });
}

// ── Eventos de Onboarding & Premium ───────────────────────────────────────

/** Dispara quando onboarding é concluído — métrica de ativação */
export function trackOnboardingCompleted(selectedProfile: string, isPremium: boolean) {
  log('onboarding_completed', {
    selected_profile: selectedProfile,
    is_premium: isPremium,
  });
}

/** Dispara quando usuário seleciona um plano premium no checkout */
export function trackSubscriptionUpgraded(planId: string, planPrice: number) {
  log('subscription_upgraded', {
    plan_id: planId,
    plan_price: planPrice,
    currency: 'BRL',
  });
}

// ── Eventos de Calculadora (CALC-HUB) ─────────────────────────────────────

/** Dispara quando usuário abre uma calculadora */
export function trackCalculatorUsed(calcId: string, calcName: string, area: string) {
  log('calculator_used', {
    calculator_id: calcId,
    calculator_name: calcName,
    area,
  });
}

// ── Eventos de CASES ───────────────────────────────────────────────────────

/** Dispara quando intake IA é submetido */
export function trackIntakeSubmitted(confidence: string) {
  log('intake_submitted', { confidence });
}

/** Dispara quando um novo caso clínico é criado */
export function trackCaseCreated(isSurgical: boolean) {
  log('case_created', { is_surgical: isSurgical });
}

// ── Eventos de BOTTOK ──────────────────────────────────────────────────────

/** Dispara quando uma consulta é enviada ao BOTTOK */
export function trackBottokQuery(thematicFilter: string | null) {
  log('bottok_query', { thematic_filter: thematicFilter ?? 'none' });
}
