import { getModuleById } from './registry';
import type { CommandSimulationResult } from './types';

export type PwaLaunchStatus = 'ready' | 'handoff_required' | 'confirmation_required' | 'blocked' | 'idle';

export interface PwaLaunchPlan {
  status: PwaLaunchStatus;
  moduleId?: string;
  moduleName?: string;
  route?: string;
  targetUrl?: string;
  navigationState?: { url: string };
  postMessage?: Record<string, unknown>;
  helperMessage: string;
  actionLabel: string;
  securityNotes: string[];
  automation: {
    canOpenModule: boolean;
    canSendContext: boolean;
    canPostMessage: boolean;
    requiresConsent: boolean;
    requiresMedicalReview: boolean;
    persistsData: boolean;
  };
}

export type PwaLaunchExecutionStatus = 'no_op' | 'navigate' | 'handoff' | 'confirmation' | 'blocked';

export interface PwaLaunchExecution {
  status: PwaLaunchExecutionStatus;
  shouldNavigate: boolean;
  requiresUserAction: boolean;
  route?: string;
  navigationState?: { url: string };
  postMessage?: {
    targetOrigin: string;
    payload: Record<string, unknown>;
  };
  userMessage: string;
  auditEvents: string[];
}

export interface PwaLaunchExecutionOptions {
  allowedOrigins?: string[];
}

export function createPwaLaunchPlan(result: CommandSimulationResult | null): PwaLaunchPlan {
  if (!result) {
    return {
      status: 'idle',
      helperMessage: 'O Concierge esta pronto para ajudar dentro do OTTO PWA.',
      actionLabel: 'Aguardando comando',
      securityNotes: ['Nenhum modulo preparado.'],
      automation: emptyAutomation()
    };
  }

  if (result.decision.action.kind === 'refuse') {
    return {
      status: 'blocked',
      helperMessage: result.decision.userMessage,
      actionLabel: 'Bloqueado',
      securityNotes: ['Guardrail impediu a abertura do modulo.'],
      automation: emptyAutomation()
    };
  }

  const moduleId = result.activation.moduleId ?? result.decision.action.moduleId;
  const module = moduleId ? getModuleById(moduleId) : undefined;
  const targetUrl = extractTargetUrl(result) ?? module?.currentUrl;
  const postMessage = extractPostMessage(result);
  const requiresConsent = Boolean(result.adapterResponse?.payload?.consentRequired);
  const requiresMedicalReview = Boolean(result.adapterResponse?.payload?.requiresMedicalReview)
    || Boolean(result.adapterResponse?.payload?.requiresReviewBeforeBilling);
  const persistsData = Boolean(result.adapterResponse?.payload?.persistsData);

  if (result.activation.mode === 'confirmation') {
    return compactPlan({
      status: 'confirmation_required',
      moduleId,
      moduleName: module?.displayName,
      targetUrl,
      route: targetUrl ? routeForTarget(targetUrl) : undefined,
      postMessage,
      helperMessage: 'Posso preparar o modulo, mas essa acao precisa de confirmacao no PWA.',
      actionLabel: 'Confirmar no PWA',
      securityNotes: ['Acao aguardando confirmacao explicita do medico.'],
      automation: {
        canOpenModule: false,
        canSendContext: Boolean(module?.policies.supportsPostMessage),
        canPostMessage: Boolean(postMessage),
        requiresConsent,
        requiresMedicalReview,
        persistsData
      }
    });
  }

  if (result.activation.mode === 'handoff' || result.adapterResponse?.status === 'needs_handoff') {
    return compactPlan({
      status: 'handoff_required',
      moduleId,
      moduleName: module?.displayName,
      targetUrl,
      route: targetUrl ? routeForTarget(targetUrl) : undefined,
      postMessage,
      helperMessage: handoffMessage(module?.displayName, requiresConsent),
      actionLabel: requiresConsent ? 'Continuar com consentimento' : 'Continuar no PWA seguro',
      securityNotes: [
        'Fluxo sensivel: continuar em superficie autenticada.',
        'Nenhum dado bruto deve ser colocado na URL.'
      ],
      automation: {
        canOpenModule: true,
        canSendContext: Boolean(module?.policies.supportsPostMessage),
        canPostMessage: Boolean(postMessage),
        requiresConsent,
        requiresMedicalReview: true,
        persistsData
      }
    });
  }

  return compactPlan({
    status: 'ready',
    moduleId,
    moduleName: module?.displayName,
    targetUrl,
    route: targetUrl ? routeForTarget(targetUrl) : undefined,
    postMessage,
    helperMessage: readyMessage(module?.displayName),
    actionLabel: 'Abrir no PWA',
    securityNotes: [
      'Abrir via ModuleFrame com contexto Firebase verificado.',
      postMessage ? 'Enviar contexto do Concierge via postMessage apos load do iframe.' : 'Sem postMessage necessario neste adapter.'
    ],
    automation: {
      canOpenModule: Boolean(targetUrl),
      canSendContext: Boolean(module?.policies.supportsPostMessage),
      canPostMessage: Boolean(postMessage),
      requiresConsent,
      requiresMedicalReview,
      persistsData
    }
  });
}

type PwaLaunchPlanDraft = Omit<
  PwaLaunchPlan,
  'moduleId' | 'moduleName' | 'route' | 'targetUrl' | 'navigationState' | 'postMessage'
> & {
  moduleId?: string | undefined;
  moduleName?: string | undefined;
  route?: string | undefined;
  targetUrl?: string | undefined;
  postMessage?: Record<string, unknown> | undefined;
};

function compactPlan(plan: PwaLaunchPlanDraft): PwaLaunchPlan {
  return {
    status: plan.status,
    helperMessage: plan.helperMessage,
    actionLabel: plan.actionLabel,
    securityNotes: plan.securityNotes,
    automation: plan.automation,
    ...(plan.moduleId ? { moduleId: plan.moduleId } : {}),
    ...(plan.moduleName ? { moduleName: plan.moduleName } : {}),
    ...(plan.route ? { route: plan.route } : {}),
    ...(plan.targetUrl ? { targetUrl: plan.targetUrl, navigationState: { url: plan.targetUrl } } : {}),
    ...(plan.postMessage ? { postMessage: plan.postMessage } : {})
  };
}

function routeForTarget(targetUrl: string): string {
  return targetUrl.startsWith('http') ? '/modules/webview' : targetUrl;
}

function extractTargetUrl(result: CommandSimulationResult): string | undefined {
  const payloadUrl = result.adapterResponse?.payload?.url;
  if (typeof payloadUrl === 'string') return payloadUrl;
  return result.activation.url;
}

function extractPostMessage(result: CommandSimulationResult): Record<string, unknown> | undefined {
  const postMessage = result.adapterResponse?.payload?.postMessage;
  if (!postMessage || typeof postMessage !== 'object' || Array.isArray(postMessage)) return undefined;
  return postMessage as Record<string, unknown>;
}

function readyMessage(moduleName = 'o modulo OTTO'): string {
  return `Pronto. Posso abrir ${moduleName} dentro do OTTO PWA e levar o contexto certo.`;
}

function handoffMessage(moduleName = 'o modulo OTTO', requiresConsent: boolean): string {
  if (requiresConsent) {
    return `${moduleName} precisa de PWA autenticado e consentimento antes de continuar.`;
  }

  return `${moduleName} deve continuar no PWA seguro antes de qualquer dado sensivel.`;
}

function emptyAutomation(): PwaLaunchPlan['automation'] {
  return {
    canOpenModule: false,
    canSendContext: false,
    canPostMessage: false,
    requiresConsent: false,
    requiresMedicalReview: false,
    persistsData: false
  };
}

export function executePwaLaunchPlan(
  plan: PwaLaunchPlan,
  options: PwaLaunchExecutionOptions = {}
): PwaLaunchExecution {
  if (plan.status === 'idle') {
    return {
      status: 'no_op',
      shouldNavigate: false,
      requiresUserAction: false,
      userMessage: plan.helperMessage,
      auditEvents: ['pwa.launch.idle']
    };
  }

  if (plan.status === 'blocked') {
    return {
      status: 'blocked',
      shouldNavigate: false,
      requiresUserAction: false,
      userMessage: plan.helperMessage,
      auditEvents: ['pwa.launch.blocked']
    };
  }

  if (plan.status === 'confirmation_required') {
    return compactExecution({
      status: 'confirmation',
      shouldNavigate: false,
      requiresUserAction: true,
      route: plan.route,
      navigationState: plan.navigationState,
      userMessage: 'Confirmacao explicita necessaria antes de abrir o modulo.',
      auditEvents: ['pwa.launch.confirmation_required']
    });
  }

  if (plan.status === 'handoff_required') {
    return compactExecution({
      status: 'handoff',
      shouldNavigate: false,
      requiresUserAction: true,
      route: plan.route,
      navigationState: plan.navigationState,
      postMessage: buildPostMessage(plan, options),
      userMessage: 'Continuar em tela segura do PWA antes de executar o modulo.',
      auditEvents: [
        'pwa.launch.handoff_required',
        ...(plan.automation.requiresConsent ? ['pwa.launch.consent_required'] : [])
      ]
    });
  }

  if (!plan.route) {
    return {
      status: 'blocked',
      shouldNavigate: false,
      requiresUserAction: false,
      userMessage: 'Plano sem rota PWA valida.',
      auditEvents: ['pwa.launch.missing_route']
    };
  }

  const postMessage = buildPostMessage(plan, options);
  if (plan.postMessage && !postMessage) {
    return {
      status: 'blocked',
      shouldNavigate: false,
      requiresUserAction: false,
      userMessage: 'Origem do modulo nao permitida para postMessage.',
      auditEvents: ['pwa.launch.postmessage_origin_blocked']
    };
  }

  return compactExecution({
    status: 'navigate',
    shouldNavigate: true,
    requiresUserAction: false,
    route: plan.route,
    navigationState: plan.navigationState,
    postMessage,
    userMessage: 'Plano pronto para navegacao controlada pelo OTTO PWA.',
    auditEvents: [
      'pwa.launch.navigate',
      ...(postMessage ? ['pwa.launch.postmessage_queued'] : [])
    ]
  });
}

type PwaLaunchExecutionDraft = Omit<PwaLaunchExecution, 'route' | 'navigationState' | 'postMessage'> & {
  route?: string | undefined;
  navigationState?: { url: string } | undefined;
  postMessage?: PwaLaunchExecution['postMessage'] | undefined;
};

function compactExecution(execution: PwaLaunchExecutionDraft): PwaLaunchExecution {
  return {
    status: execution.status,
    shouldNavigate: execution.shouldNavigate,
    requiresUserAction: execution.requiresUserAction,
    userMessage: execution.userMessage,
    auditEvents: execution.auditEvents,
    ...(execution.route ? { route: execution.route } : {}),
    ...(execution.navigationState ? { navigationState: execution.navigationState } : {}),
    ...(execution.postMessage ? { postMessage: execution.postMessage } : {})
  };
}

function buildPostMessage(
  plan: PwaLaunchPlan,
  options: PwaLaunchExecutionOptions
): PwaLaunchExecution['postMessage'] | undefined {
  if (!plan.postMessage) return undefined;
  const targetOrigin = plan.targetUrl ? originFromUrl(plan.targetUrl) : undefined;
  if (!targetOrigin) return undefined;

  if (options.allowedOrigins && !options.allowedOrigins.includes(targetOrigin)) {
    return undefined;
  }

  return {
    targetOrigin,
    payload: plan.postMessage
  };
}

function originFromUrl(targetUrl: string): string | undefined {
  try {
    return new URL(targetUrl).origin;
  } catch {
    return undefined;
  }
}
