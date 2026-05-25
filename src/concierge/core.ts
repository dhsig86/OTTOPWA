import { classifyIntent } from './intents';
import { runModuleAdapter } from './adapters';
import { getModuleById } from './registry';
import { evaluateGuardrails } from './guardrails';
import { MODULE_CAPABILITIES_DB } from './capabilities_db';
import type { ActionKind, CommandSimulationResult, ConciergeDecision, ConciergeInput, IdentityContext, ModuleActivation } from './types';

export function decide(input: ConciergeInput): ConciergeDecision {
  const traceId = makeTraceId(input);
  const text = input.input.text ?? '';
  const candidates = classifyIntent(text);
  const selected = candidates[0];

  if (!selected || selected.confidence < 0.6) {
    return refusal(traceId, 'unknown.low_confidence', 'Entendi parcialmente. Voce quer abrir uma calculadora, buscar um codigo PROCOD ou consultar o BOTTOK?');
  }

  if (selected.intent.id === 'concierge.help') {
    return handleHelpIntent(input, selected, traceId);
  }

  const module = getModuleById(selected.intent.moduleId);
  if (!module) {
    return refusal(traceId, selected.intent.id, 'Modulo ainda nao mapeado no Concierge.');
  }

  const guardrail = evaluateGuardrails(input, selected.intent, module);
  const actionKind = mapActionKind(selected.intent.actionKind, guardrail.decision);

  if (actionKind === 'refuse') {
    return {
      decisionId: `decision_${traceId}`,
      intentId: selected.intent.id,
      confidence: selected.confidence,
      riskLevel: selected.intent.riskLevel,
      action: {
        kind: 'refuse',
        moduleId: module.id,
        requiresConfirmation: false
      },
      audit: selected.intent.auditPolicy,
      userMessage: guardrail.userMessage ?? 'Nao posso executar essa acao.',
      debug: {
        traceId,
        selectedIntent: selected.intent.id,
        guardrailDecision: guardrail.decision
      }
    };
  }

  return {
    decisionId: `decision_${traceId}`,
    intentId: selected.intent.id,
    confidence: selected.confidence,
    riskLevel: selected.intent.riskLevel,
    action: {
      kind: actionKind,
      moduleId: module.id,
      url: module.currentUrl,
      payload: {
        adapterStatus: module.adapter.status,
        matchedTerms: selected.matchedTerms,
        guardrailReason: guardrail.reason,
        identityVerified: input.identity.verification?.status === 'verified',
        preferencesApplied: input.identity.verification?.status === 'verified' && Boolean(input.identity.preferences)
      },
      requiresConfirmation: guardrail.decision === 'confirm'
    },
    audit: selected.intent.auditPolicy,
    userMessage: guardrail.userMessage ?? defaultMessage(actionKind, module.displayName),
    debug: {
      traceId,
      selectedIntent: selected.intent.id,
      guardrailDecision: guardrail.decision
    }
  };
}

export async function simulateCommandActivation(input: ConciergeInput): Promise<CommandSimulationResult> {
  const startedAt = performance.now();
  const decision = decide(input);
  const activation = toActivation(decision);

  const adapterResponse = activation.shouldActivate && decision.action.moduleId
    ? await runModuleAdapter({
      moduleId: decision.action.moduleId,
      intentId: decision.intentId,
      surface: input.surface,
      input: compactInput(input),
      identity: compactIdentity(input),
      traceId: decision.debug.traceId
    })
    : undefined;

  return {
    decision,
    activation,
    ...(adapterResponse ? { adapterResponse } : {}),
    durationMs: performance.now() - startedAt
  };
}

function toActivation(decision: ConciergeDecision): ModuleActivation {
  const moduleId = decision.action.moduleId;

  if (decision.action.kind === 'refuse') {
    return {
      shouldActivate: false,
      mode: 'none',
      reason: 'decision_refused'
    };
  }

  if (decision.action.kind === 'request_confirmation') {
    return compactActivation({
      shouldActivate: false,
      mode: 'confirmation',
      reason: 'confirmation_required',
      ...(moduleId ? { moduleId } : {}),
      ...(decision.action.url ? { url: decision.action.url } : {})
    });
  }

  if (decision.action.kind === 'handoff_to_pwa') {
    return compactActivation({
      shouldActivate: true,
      mode: 'handoff',
      reason: 'handoff_to_pwa',
      ...(moduleId ? { moduleId } : {}),
      ...(decision.action.url ? { url: decision.action.url } : {})
    });
  }

  if (decision.action.kind === 'deep_link') {
    return compactActivation({
      shouldActivate: true,
      mode: 'deep_link',
      reason: 'deep_link_ready',
      ...(moduleId ? { moduleId } : {}),
      ...(decision.action.url ? { url: decision.action.url } : {})
    });
  }

  if (decision.action.kind === 'open_module') {
    return compactActivation({
      shouldActivate: true,
      mode: 'open_module',
      reason: 'module_open_ready',
      ...(moduleId ? { moduleId } : {}),
      ...(decision.action.url ? { url: decision.action.url } : {})
    });
  }

  return compactActivation({
    shouldActivate: Boolean(moduleId),
    mode: 'adapter',
    reason: 'adapter_ready',
    ...(moduleId ? { moduleId } : {}),
    ...(decision.action.url ? { url: decision.action.url } : {})
  });
}

function compactInput(input: ConciergeInput): { text?: string; mediaRef?: string } {
  return {
    ...(input.input.text ? { text: input.input.text } : {}),
    ...(input.input.mediaRef ? { mediaRef: input.input.mediaRef } : {})
  };
}

function compactIdentity(input: ConciergeInput): Pick<IdentityContext, 'uid' | 'profile' | 'verification' | 'preferences'> {
  const verified = input.identity.verification?.status === 'verified';
  return {
    uid: input.identity.uid,
    profile: input.identity.profile,
    ...(input.identity.verification ? { verification: input.identity.verification } : {}),
    ...(verified && input.identity.preferences ? { preferences: input.identity.preferences } : {})
  };
}

function compactActivation(input: {
  shouldActivate: boolean;
  mode: ModuleActivation['mode'];
  reason: string;
  moduleId?: string;
  url?: string;
}): ModuleActivation {
  return {
    shouldActivate: input.shouldActivate,
    mode: input.mode,
    reason: input.reason,
    ...(input.moduleId ? { moduleId: input.moduleId } : {}),
    ...(input.url ? { url: input.url } : {})
  };
}

function mapActionKind(intentAction: ActionKind, guardrailDecision: 'allow' | 'confirm' | 'handoff' | 'refuse'): ActionKind {
  if (guardrailDecision === 'refuse') return 'refuse';
  if (guardrailDecision === 'handoff') return 'handoff_to_pwa';
  if (guardrailDecision === 'confirm') return 'request_confirmation';
  return intentAction;
}

function defaultMessage(actionKind: ActionKind, moduleName: string): string {
  if (actionKind === 'respond') return `Vou buscar isso em ${moduleName}.`;
  if (actionKind === 'deep_link' || actionKind === 'open_module') return `Vou abrir ${moduleName}.`;
  if (actionKind === 'call_tool') return `Vou acionar ${moduleName} em modo seguro.`;
  if (actionKind === 'handoff_to_pwa') return 'Vou continuar esse fluxo no PWA seguro.';
  return 'Acao preparada.';
}

function refusal(traceId: string, intentId: string, userMessage: string): ConciergeDecision {
  return {
    decisionId: `decision_${traceId}`,
    intentId,
    confidence: 0,
    riskLevel: 'low',
    action: {
      kind: 'refuse',
      requiresConfirmation: false
    },
    audit: {
      eventType: 'intent.refused',
      storePayload: false,
      redactionLevel: 'partial'
    },
    userMessage,
    debug: {
      traceId,
      guardrailDecision: 'refuse'
    }
  };
}

function makeTraceId(input: ConciergeInput): string {
  return `${input.session.id}_${input.session.timestamp.replace(/[^0-9]/g, '')}`;
}

function handleHelpIntent(input: ConciergeInput, selected: any, traceId: string): ConciergeDecision {
  const text = (input.input.text ?? '').toLowerCase();
  const profile = input.identity.profile;

  const mentionedModuleId = Object.keys(MODULE_CAPABILITIES_DB).find((moduleId) => {
    const module = getModuleById(moduleId);
    const displayName = (module?.displayName ?? '').toLowerCase();
    return text.includes(moduleId) || text.includes(displayName) || (moduleId === 'imune' && text.includes('imunobiologicos'));
  });

  if (mentionedModuleId) {
    const info = MODULE_CAPABILITIES_DB[mentionedModuleId];
    const module = getModuleById(mentionedModuleId);
    if (module && info) {
      const bulletFeatures = info.mainFeatures.map((f: string) => `- ${f}`).join('\n');
      const message = `O modulo **${module.displayName}** serve para: ${info.description}\n\n**Principais Recursos:**\n${bulletFeatures}`;
      return {
        decisionId: `decision_${traceId}`,
        intentId: selected.intent.id,
        confidence: selected.confidence,
        riskLevel: 'low',
        action: {
          kind: 'open_module',
          moduleId: module.id,
          url: module.currentUrl,
          payload: {
            isHelpResponse: true,
            targetModule: module.id
          },
          requiresConfirmation: false
        },
        audit: selected.intent.auditPolicy,
        userMessage: message,
        debug: {
          traceId,
          selectedIntent: selected.intent.id,
          guardrailDecision: 'allow'
        }
      };
    }
  }

  let message = 'Olá! Sou o OTTO Concierge, o seu assistente inteligente no ecossistema.\n\n';
  if (profile === 'medico' || profile === 'estudante') {
    message += 'Como médico/estudante, você pode usar os seguintes módulos:\n' +
      '- **CID & TUSS (PROCOD):** Para codificação e faturamento cirúrgico ORL.\n' +
      '- **OTTO Cases:** Para redigir relatos de casos clínicos científicos.\n' +
      '- **OTTO Log:** Para registrar sua casuística cirúrgica com sanitização de EXIF.\n' +
      '- **PROTTO:** Prontuário inteligente com NLP.\n' +
      '- **OTTO Whisper:** Escriba inteligente de consulta.\n' +
      '- **CALC-HUB:** Calculadoras clínicas ORL.\n\n' +
      'Digite por exemplo "abrir procod", "calcular SNOT-22" ou "criar caso".';
  } else {
    message += 'Você tem acesso aos seguintes módulos para sua saúde e bem-estar:\n' +
      '- **Zumbido:** Player e Terapia Sonora para tinnitus.\n' +
      '- **OTTO Check:** Testes e triagens de acuidade auditiva.\n' +
      '- **Peri-op:** Orientações de jejum e pós-operatório de cirurgia.\n' +
      '- **OTTO Games:** Jogos educativos de saúde.\n' +
      '- **Voz:** Exercícios e análise de voz.\n\n' +
      'Como posso te ajudar hoje?';
  }

  return {
    decisionId: `decision_${traceId}`,
    intentId: selected.intent.id,
    confidence: selected.confidence,
    riskLevel: 'low',
    action: {
      kind: 'respond',
      requiresConfirmation: false
    },
    audit: selected.intent.auditPolicy,
    userMessage: message,
    debug: {
      traceId,
      selectedIntent: selected.intent.id,
      guardrailDecision: 'allow'
    }
  };
}
