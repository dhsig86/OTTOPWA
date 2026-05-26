import { classifyIntent } from './intents';
import { runModuleAdapter } from './adapters';
import { getModuleById } from './registry';
import { evaluateGuardrails } from './guardrails';
import { MODULE_CAPABILITIES_DB } from './capabilities_db';
import { OTTO_TUTORIALS } from './tutorials';
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

function findTutorial(text: string): typeof OTTO_TUTORIALS[number] | undefined {
  const tutorialTriggers = ['como funciona', 'como usar', 'tutorial', 'como faz', 'ensina', 'passo a passo', 'me explica'];
  const isTutorialRequest = tutorialTriggers.some(t => text.includes(t));
  if (!isTutorialRequest) return undefined;
  return OTTO_TUTORIALS.find(tut => {
    const module = getModuleById(tut.id);
    const displayName = (module?.displayName ?? '').toLowerCase();
    return text.includes(tut.id) || text.includes(displayName) || text.includes(tut.title.toLowerCase().split('—')[0].trim().toLowerCase());
  });
}

function handleHelpIntent(input: ConciergeInput, selected: any, traceId: string): ConciergeDecision {
  const text = (input.input.text ?? '').toLowerCase();
  const profile = input.identity.profile;

  // ── Tutorial step-by-step ───────────────────────────────────────────────
  const tutorial = findTutorial(text);
  if (tutorial) {
    const steps = tutorial.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const message = `${tutorial.emoji} **${tutorial.title}**\n\n` +
      `👥 _${tutorial.audience}_\n\n` +
      `${tutorial.summary}\n\n` +
      `**Passo a passo:**\n${steps}\n\n` +
      `💡 **Dica:** ${tutorial.tip}\n\n` +
      `Comando rápido: _"${tutorial.shortcutCommand}"_`;
    return respondDecision(traceId, selected, message, tutorial.id);
  }

  // ── Module-specific help (capabilities_db) ──────────────────────────────
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
      const message = `O modulo **${module.displayName}** serve para: ${info.description}\n\n**Principais Recursos:**\n${bulletFeatures}\n\n💡 _Diga "como funciona ${module.displayName.toLowerCase()}" para ver o tutorial passo a passo._`;
      return {
        decisionId: `decision_${traceId}`,
        intentId: selected.intent.id,
        confidence: selected.confidence,
        riskLevel: 'low',
        action: {
          kind: 'open_module',
          moduleId: module.id,
          url: module.currentUrl,
          payload: { isHelpResponse: true, targetModule: module.id },
          requiresConfirmation: false
        },
        audit: selected.intent.auditPolicy,
        userMessage: message,
        debug: { traceId, selectedIntent: selected.intent.id, guardrailDecision: 'allow' }
      };
    }
  }

  // ── Full help listing by category ───────────────────────────────────────
  let message = '🩺 **OTTO Concierge** — Seu assistente do ecossistema ORL\n\n';
  if (profile === 'medico' || profile === 'estudante') {
    message +=
      '**🏥 Atendimento Clínico:**\n' +
      '- **PROTTO** — Prontuário inteligente com IA\n' +
      '- **Whisper** — Escriba de consulta (transcrição por voz)\n' +
      '- **Triagem** — Anamnese digital pré-consulta\n' +
      '- **OCR** — Extrator de laudos e carteirinhas\n\n' +
      '**🔬 Diagnóstico e IA:**\n' +
      '- **CALC-HUB** — Calculadoras clínicas (SNOT-22, Epworth, VHI…)\n' +
      '- **Otoscop.IA** — Classificação de otoscopia por IA\n' +
      '- **Atlas** — Atlas de imagens otoscópicas + quiz\n' +
      '- **BOTTOK** — Chatbot ORL com base de conhecimento\n\n' +
      '**📋 Documentação:**\n' +
      '- **PROCOD** — Codificação CID/TUSS e faturamento\n' +
      '- **Laudo-IA** — Editor de laudos com autocompletar\n' +
      '- **Cases** — Relatos de caso clínico para publicação\n' +
      '- **LogBook** — Registro cirúrgico e casuística\n\n' +
      '**🎓 Educação e Referência:**\n' +
      '- **Acadêmico** — Simulados e questões de residência\n' +
      '- **Update** — Pílulas científicas diárias\n' +
      '- **Vídeos** — Acervo educativo ORL\n' +
      '- **Glossário** — Minidicionário ORL\n\n' +
      '**🏥 Especialidades:**\n' +
      '- **Aerodig** — Hub aerodigestivo pediátrico\n' +
      '- **Imune** — Imunobiológicos (Dupilumabe)\n' +
      '- **PeriOp** — Protocolos pré/pós-operatórios\n\n' +
      '**🧒 Para Pacientes:**\n' +
      '- **Games** — Jogos educativos de saúde\n' +
      '- **CHECK** — Triagem auditiva digital\n' +
      '- **Zumbido** — Terapia sonora para tinnitus\n' +
      '- **VOICE** — Síntese vocal para laringectomizados\n\n' +
      '_Diga "abrir [módulo]", "como funciona [módulo]" ou pergunte algo!_ 💬';
  } else {
    message +=
      '**🩺 Sua Saúde:**\n' +
      '- **CHECK** — Teste sua audição gratuitamente\n' +
      '- **Zumbido** — Terapia sonora para alívio de zumbido\n' +
      '- **VOICE** — Comunicação por voz para laringectomizados\n' +
      '- **PeriOp** — Orientações pré e pós-cirúrgicas\n\n' +
      '**🎮 Educação:**\n' +
      '- **Games** — Jogos educativos de saúde ORL\n' +
      '- **Vídeos** — Vídeos educativos sobre ouvido, nariz e garganta\n' +
      '- **Glossário** — Dicionário de termos médicos\n\n' +
      '**📋 Meus Atendimentos:**\n' +
      '- **Triagem** — Preencher antes da consulta\n\n' +
      '_Diga "abrir [módulo]" ou pergunte algo!_ 💬';
  }

  return respondDecision(traceId, selected, message);
}

function respondDecision(traceId: string, selected: any, message: string, moduleId?: string): ConciergeDecision {
  const module = moduleId ? getModuleById(moduleId) : undefined;
  return {
    decisionId: `decision_${traceId}`,
    intentId: selected.intent.id,
    confidence: selected.confidence,
    riskLevel: 'low',
    action: {
      kind: module ? 'open_module' : 'respond',
      ...(module ? { moduleId: module.id, url: module.currentUrl } : {}),
      requiresConfirmation: false
    },
    audit: selected.intent.auditPolicy,
    userMessage: message,
    debug: { traceId, selectedIntent: selected.intent.id, guardrailDecision: 'allow' }
  };
}
