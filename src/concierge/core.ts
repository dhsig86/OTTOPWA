import { classifyIntent, classifyIntentWithLLM } from './intents';
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
  const text = input.input.text ?? '';
  
  let decision: ConciergeDecision;
  
  // 1. Tentar classificação remota com DeepSeek (se o input for de texto)
  const llmCandidate = input.input.kind === 'text' && text ? await classifyIntentWithLLM(text) : null;
  
  if (llmCandidate) {
    const module = getModuleById(llmCandidate.intent.moduleId);
    if (module) {
      const guardrail = evaluateGuardrails(input, llmCandidate.intent, module);
      const actionKind = mapActionKind(llmCandidate.intent.actionKind, guardrail.decision);
      const traceId = makeTraceId(input);
      
      if (actionKind === 'refuse') {
        decision = {
          decisionId: `decision_${traceId}`,
          intentId: llmCandidate.intent.id,
          confidence: llmCandidate.confidence,
          riskLevel: llmCandidate.intent.riskLevel,
          action: {
            kind: 'refuse',
            moduleId: module.id,
            requiresConfirmation: false
          },
          audit: llmCandidate.intent.auditPolicy,
          userMessage: llmCandidate.reply ?? (guardrail.userMessage ?? 'Nao posso executar essa acao.'),
          debug: {
            traceId,
            selectedIntent: llmCandidate.intent.id,
            guardrailDecision: guardrail.decision,
            classifiedBy: 'deepseek'
          }
        };
      } else {
        decision = {
          decisionId: `decision_${traceId}`,
          intentId: llmCandidate.intent.id,
          confidence: llmCandidate.confidence,
          riskLevel: llmCandidate.intent.riskLevel,
          action: {
            kind: actionKind,
            moduleId: module.id,
            url: module.currentUrl,
            payload: {
              adapterStatus: module.adapter.status,
              matchedTerms: llmCandidate.matchedTerms,
              guardrailReason: guardrail.reason,
              identityVerified: input.identity.verification?.status === 'verified',
              preferencesApplied: input.identity.verification?.status === 'verified' && Boolean(input.identity.preferences)
            },
            requiresConfirmation: guardrail.decision === 'confirm'
          },
          audit: llmCandidate.intent.auditPolicy,
          userMessage: llmCandidate.reply ?? (guardrail.userMessage ?? defaultMessage(actionKind, module.displayName)),
          debug: {
            traceId,
            selectedIntent: llmCandidate.intent.id,
            guardrailDecision: guardrail.decision,
            classifiedBy: 'deepseek'
          }
        };
      }
    } else {
      // Fallback para decide local se módulo do LLM sumir
      decision = decide(input);
    }
  } else {
    // Fallback: classificador local tradicional por regras/regex se LLM retornar null ou falhar
    decision = decide(input);
  }

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
      '**🌐 1. A Estrutura Central**\n' +
      '- **OTTO PWA (Shell Principal):** É a "nave-mãe" do sistema. Um portal único e seguro que unifica todos os sub-módulos dentro de uma interface fluida, gerenciando a segurança (Firebase Auth) e a comunicação entre telas com privacidade total de dados.\n\n' +
      '**🩺 2. Prontuário, Escrita e Produtividade Clínica**\n' +
      '- **OTTO PROTTO (Prontuário Inteligente):** Um assistente de escrita de consultas. Ele sintetiza dados coletados em triagens prévias ou digitação livre e gera rascunhos de evolução clínica estruturada, diagnósticos e receitas médicas em segundos.\n' +
      '- **OTTO LAUDO-IA (Editor Inteligente):** Um editor de texto para laudos de exames físicos e procedimentos que usa IA para autocompletar termos médicos e descrever estruturas anatômicas de forma ágil e padronizada.\n' +
      '- **OTTO WHISPER (Escriba Médico):** Serviço que grava o áudio das consultas (com consentimento) e faz a transcrição médica precisa com correções automáticas de nomenclatura anatômica ORL.\n' +
      '- **OTTO OCR (Leitor de PDFs/Guias):** Microserviço de inteligência visual para ler carteirinhas de planos, exames laboratoriais ou laudos de imagem anexados, extraindo as informações automaticamente.\n\n' +
      '**✂️ 3. Centro Cirúrgico e Laudos Administrativos**\n' +
      '- **OTTOPROCOD (Laudos Cirúrgicos):** Auxilia a faturamento e auditoria cirúrgica. Mapeia o procedimento realizado e gera instantaneamente o laudo cirúrgico padrão, associando os códigos TUSS, CID-10 e a solicitação justificada de OPME (órteses, próteses e materiais especiais).\n' +
      '- **OTTO LOGBOOK (Estatísticas de Casuística):** O registro pessoal das cirurgias do médico. Além de organizar a agenda cirúrgica, ele gera relatórios estatísticos e gráficos sobre a produtividade, complicações e dados de casuística (importante para residentes e prestação de contas de auditoria).\n\n' +
      '**📊 4. Calculadoras, Decisão Clínica e Imunobiológicos**\n' +
      '- **OTTO IMUNE (Elegibilidade para Imunobiológicos):** Uma calculadora que avalia se o paciente com Rinossinusite Crônica com Pólipos Nasais (RSCcPN) cumpre os critérios internacionais (EPOS/EUFOREA) ou da ANS para indicação de imunobiológicos (como Dupilumabe, Omalizumabe, Mepolizumabe). Ele gera automaticamente o relatório de justificativa detalhado para liberação no plano de saúde.\n' +
      '- **OTTO CALC-HUB (Calculadoras & PROMs):** Central de calculadoras otorrinolaringológicas, englobando questionários de qualidade de vida (SNOT-22, THI para Zumbido, NOSE para desvio de septo) e estadiamentos oncológicos (TNM) de cabeça e pescoço.\n\n' +
      '**🦻 5. Triagem e Reabilitação de Pacientes**\n' +
      '- **OTTO CHECK (Audiômetro & Zumbido):** Uma ferramenta de triagem auditiva domiciliar rápida, que inclui um gerador de frequências para identificar o pitch/loudness do Zumbido do paciente e prescrever terapia sonora de mascaramento.\n' +
      '- **OTTO VOICE (Voz Emocional):** Um sintetizador de voz humana com entonação emocional por IA, projetado para auxiliar na comunicação e reabilitação fonológica de pacientes laringectomizados.\n\n' +
      '**📚 6. Ensino, Imagens e Evidência Científica**\n' +
      '- **OTTO ATLAS (com OTOSCOP-IA):** Um acervo clínico interativo de fotos e vídeos otoscópicos, rinoscópicos e laringoscópicos. Ele embute a IA de triagem de ouvido (OTOSCOP-IA) que auxilia na identificação de patologias timpânicas.\n' +
      '- **OTTO CASES (Relatos de Casos):** Um assistente inteligente para estruturação e formatação de relatos de casos clínicos ORL, voltado para publicação científica ou discussões acadêmicas.\n' +
      '- **OTTO NEWS / UPDATE (Evidências de IA):** Rastreador inteligente que lê bases internacionais (PubMed, arXiv) diariamente, buscando os artigos e diretrizes de otorrino mais recentes, trazendo resumos curados por IA.\n' +
      '- **TEST_PG (Simulados MCQ):** Banco de questões de múltipla escolha e simulados integrados voltados para o aprendizado e preparação de residentes para provas de título da especialidade.\n' +
      '- **BOTTOK (Chatbot de Consulta RAG):** Um chatbot inteligente alimentado por RAG (Geração Aumentada por Recuperação) treinado especificamente com livros texto e consensos de Otorrinolaringologia para sanar dúvidas rápidas de conduta terapêutica na beira do leito.\n' +
      '- **OTTO GAMES (Pediatria Lúdica):** Jogos educativos simples para ensinar conceitos de higiene nasal e cuidados auditivos para crianças de forma lúdica no consultório.\n\n' +
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
