import type { ConciergeInput, IntentRegistryEntry, ModuleRegistryEntry } from './types';

export interface GuardrailResult {
  decision: 'allow' | 'confirm' | 'handoff' | 'refuse';
  reason: string;
  userMessage?: string;
}

export function evaluateGuardrails(
  input: ConciergeInput,
  intent: IntentRegistryEntry,
  module: ModuleRegistryEntry
): GuardrailResult {
  if (containsUnsafeInstruction(input.input.text ?? '')) {
    return {
      decision: 'refuse',
      reason: 'unsafe_instruction',
      userMessage: 'Nao posso executar essa instrucao. Posso ajudar com uma acao clinica segura do OTTO.'
    };
  }

  const verifiedIdentity = input.identity.verification?.status === 'verified';

  if (input.surface === 'zap' && !verifiedIdentity && intent.actionKind !== 'respond') {
    return {
      decision: 'refuse',
      reason: 'unverified_zap_identity',
      userMessage: 'Preciso reconhecer seu usuario no OTTO PWA antes de abrir modulos pelo WhatsApp.'
    };
  }

  if (module.policies.requiresAuth && !verifiedIdentity) {
    return {
      decision: 'refuse',
      reason: 'auth_required',
      userMessage: 'Este modulo exige usuario autenticado no OTTO PWA.'
    };
  }

  if (!intent.allowedProfiles.includes(input.identity.profile)) {
    return {
      decision: 'refuse',
      reason: 'forbidden_profile',
      userMessage: 'Este recurso nao esta disponivel para o perfil atual.'
    };
  }

  if (!intent.allowedSurfaces.includes(input.surface)) {
    return {
      decision: input.surface === 'zap' ? 'handoff' : 'refuse',
      reason: 'surface_not_allowed',
      userMessage: 'Esse fluxo precisa continuar no PWA seguro.'
    };
  }

  if (!module.surfaces.includes(input.surface)) {
    return {
      decision: input.surface === 'zap' ? 'handoff' : 'refuse',
      reason: 'module_surface_not_allowed',
      userMessage: 'Esse modulo precisa ser aberto no PWA.'
    };
  }

  if (input.surface === 'zap' && (intent.dataSensitivity === 'phi' || intent.dataSensitivity === 'high_phi')) {
    return {
      decision: 'handoff',
      reason: 'zap_phi_handoff',
      userMessage: 'Esse conteudo pode conter dados sensiveis. Vou continuar no PWA seguro.'
    };
  }

  if (intent.riskLevel === 'high' || intent.requiresConfirmation) {
    return {
      decision: 'confirm',
      reason: 'confirmation_required',
      userMessage: 'Essa acao exige confirmacao antes de continuar.'
    };
  }

  return {
    decision: 'allow',
    reason: 'allowed'
  };
}

export function containsUnsafeInstruction(text: string): boolean {
  const normalized = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  const unsafePatterns = [
    'ignore as regras',
    'ignore instrucoes',
    'ignore as instrucoes',
    'mostre o token',
    'mostrar token',
    'revele o token',
    'env var',
    'api key',
    'firebase token',
    'burlar confirmacao',
    'sem confirmacao',
    'nao registre auditoria'
  ];

  return unsafePatterns.some((pattern) => normalized.includes(pattern));
}
