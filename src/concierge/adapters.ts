import { findCalcHubCalculator, getCalcHubCatalogByArea, getModuleById } from './registry';
import type { AdapterRequest, AdapterResponse, AdapterStatus, RedactionLevel } from './types';

export type MockAdapter = (request: AdapterRequest) => Promise<AdapterResponse>;

export interface AdapterRunnerOptions {
  adapterModeOverride?: AdapterStatus;
  timeoutMs?: number;
}

export const MOCK_ADAPTERS: Record<string, MockAdapter> = {
  calc: async (request) => success(request, 'Abrir calculadora no CALC-HUB.', 'partial', {
    kind: 'deeplink',
    suggestedSlug: findCalcHubCalculator(request.input.text ?? '')?.id ?? 'nose'
  }),
  procod: async (request) => success(request, 'Buscar codigo no PROCOD para conferencia.', 'partial', {
    kind: 'search',
    query: request.input.text ?? '',
    safeForZap: true
  }),
  ocr: async (request) => {
    if (request.surface === 'zap') {
      return {
        status: 'needs_handoff',
        moduleId: request.moduleId,
        intentId: request.intentId,
        summary: 'Resumo OCR redigido: documento recebido e possivelmente clinico. Revise texto completo e edite no OTTO PWA.',
        redactionLevel: 'strict',
        payload: {
          handoffTarget: 'pwa',
          shortRedactedSummary: true,
          fullTextIncluded: false,
          containsRawPhi: false
        },
        debug: {
          traceId: request.traceId,
          adapterStatus: 'mock',
          containsPhi: true
        }
      };
    }
    return success(request, 'OCR simulado criado para revisao no PWA.', 'strict', {
      resultRef: `mock_ocr_${request.traceId}`,
      fullTextStored: false
    });
  },
  videos: async (request) => success(request, 'Buscar videos educacionais ORL.', 'none', {
    query: request.input.text ?? '',
    safeForZap: true
  }),
  bottok: async (request) => success(request, 'Resposta BOTTOK simulada com guardrails clinicos.', 'partial', {
    answerRef: `mock_bottok_${request.traceId}`,
    includesSources: false
  }),
  whisper: async (request) => whisperHandoff(request),
  autolaudo: async (request) => autolaudoDeepLink(request),
  cases: async (request) => success(request, 'Rascunho de caso simulado criado para revisao.', 'strict', {
    draftRef: `mock_case_${request.traceId}`,
    publishAutomatically: false
  }),
  protto: async (request) => prottoDeepLink(request)
};

export const CONTROLLED_ADAPTERS: Record<string, Partial<Record<AdapterStatus, MockAdapter>>> = {
  calc: {
    deeplink: async (request) => calcDeepLink(request),
    read_only: async (request) => calcDeepLink(request)
  },
  procod: {
    deeplink: async (request) => procodReadOnlyDeepLink(request),
    read_only: async (request) => procodReadOnlyDeepLink(request)
  },
  protto: {
    deeplink: async (request) => prottoDeepLink(request),
    read_only: async (request) => prottoDeepLink(request)
  },
  autolaudo: {
    deeplink: async (request) => autolaudoDeepLink(request),
    read_only: async (request) => autolaudoDeepLink(request)
  },
  cases: {
    deeplink: async (request) => casesDeepLink(request),
    read_only: async (request) => casesDeepLink(request)
  }
};

export async function runModuleAdapter(request: AdapterRequest, options: AdapterRunnerOptions = {}): Promise<AdapterResponse> {
  const module = getModuleById(request.moduleId);
  const mode = options.adapterModeOverride ?? module?.adapter.status ?? 'mock';
  const timeoutMs = options.timeoutMs ?? module?.adapter.timeoutMs ?? 1500;
  const adapter = CONTROLLED_ADAPTERS[request.moduleId]?.[mode] ?? 
                  MOCK_ADAPTERS[request.moduleId] ?? 
                  (async (req) => success(req, `Módulo ${module?.displayName || req.moduleId} pronto para abertura.`, 'none', { kind: 'open', url: module?.currentUrl }));

  return withTimeout(adapter(request), timeoutMs, request);
}

export async function runMockAdapter(request: AdapterRequest, timeoutMs = 1500): Promise<AdapterResponse> {
  const adapter = MOCK_ADAPTERS[request.moduleId];
  if (!adapter) {
    return errorResponse(request, 'Adapter mock nao encontrado.');
  }

  return withTimeout(adapter(request), timeoutMs, request);
}

export async function withTimeout(
  operation: Promise<AdapterResponse>,
  timeoutMs: number,
  request: AdapterRequest
): Promise<AdapterResponse> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<AdapterResponse>((resolve) => {
    timer = setTimeout(() => resolve(timeoutResponse(request)), timeoutMs);
  });

  const response = await Promise.race([operation, timeout]);
  if (timer) clearTimeout(timer);
  return response;
}

function success(
  request: AdapterRequest,
  summary: string,
  redactionLevel: RedactionLevel,
  payload: Record<string, unknown>
): AdapterResponse {
  const module = getModuleById(request.moduleId);
  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary,
    redactionLevel,
    payload,
    debug: {
      traceId: request.traceId,
      adapterStatus: module?.adapter.status ?? 'mock',
      containsPhi: redactionLevel === 'strict'
    }
  };
}

function whisperHandoff(request: AdapterRequest): AdapterResponse {
  const module = getModuleById(request.moduleId);
  return {
    status: 'needs_handoff',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'OTTO Whisper exige PWA seguro, consentimento do paciente e revisao medica antes de salvar ou exportar transcricao.',
    redactionLevel: 'strict',
    payload: {
      handoffTarget: 'pwa',
      url: module?.currentUrl ?? 'https://otto-whisper.netlify.app',
      consentRequired: true,
      audioNotPersistedByDefault: true,
      rawTranscriptIncluded: false,
      exportsAllowedAfterReview: ['protto', 'cases', 'autolaudo'],
      postMessage: {
        type: 'otto-whisper-open',
        mode: 'record_or_upload'
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'mock',
      containsPhi: true
    }
  };
}

function calcDeepLink(request: AdapterRequest): AdapterResponse {
  if (request.intentId === 'calc.list') {
    return calcCatalogResponse(request);
  }

  const module = getModuleById(request.moduleId);
  const calculator = findCalcHubCalculator(request.input.text ?? '');
  const targetTab = calculator?.id ?? 'nose';
  const baseUrl = module?.currentUrl ?? 'https://otto-calc-hub.vercel.app/';
  const plannedDeepLinkUrl = buildCalcHubUrl(baseUrl, targetTab);
  const opensTargetToday = targetTab === 'nose';
  const preferredCalculatorIds = new Set(request.identity?.preferences?.preferredCalculatorIds ?? []);

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: opensTargetToday
      ? 'CALC-HUB pode ser aberto diretamente; NOSE ja e a aba inicial atual. Nenhum calculo foi executado e nada foi salvo.'
      : 'CALC-HUB pode ser aberto com seguranca, mas a selecao automatica desta aba ainda exige suporte nativo no app real.',
    redactionLevel: 'partial',
    payload: {
      kind: 'deeplink',
      suggestedSlug: targetTab,
      calculatorName: calculator?.name ?? 'NOSE',
      area: calculator?.area ?? 'Rinologia',
      preferredCalculator: preferredCalculatorIds.has(targetTab),
      targetTab,
      url: baseUrl,
      plannedDeepLinkUrl,
      currentBehavior: opensTargetToday ? 'opens_target_by_default' : 'opens_hub_default_nose_until_native_support',
      requiresNativeDeepLinkSupport: !opensTargetToday,
      readOnly: true,
      executesCalculation: false,
      persistsData: false,
      postMessage: {
        type: 'otto-calc-open',
        calculator: targetTab
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'deeplink',
      containsPhi: false
    }
  };
}

function calcCatalogResponse(request: AdapterRequest): AdapterResponse {
  const preferredAreas = new Set(request.identity?.preferences?.preferredCalcAreas ?? []);
  const preferredCalculatorIds = new Set(request.identity?.preferences?.preferredCalculatorIds ?? []);
  const hasPreferences = preferredAreas.size > 0 || preferredCalculatorIds.size > 0;

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: hasPreferences
      ? 'Lista CALC-HUB organizada por areas, com preferencias reconhecidas marcadas sem alterar a ordem do display. Escolha uma calculadora pelo nome para abrir em contexto.'
      : 'Lista CALC-HUB organizada por areas, espelhando o display atual. Escolha uma calculadora pelo nome para abrir em contexto.',
    redactionLevel: 'none',
    payload: {
      kind: 'catalog',
      catalogByArea: getCalcHubCatalogByArea().map((group) => ({
        area: group.area,
        preferredArea: preferredAreas.has(group.area),
        calculators: group.calculators.map((calculator) => ({
          id: calculator.id,
          name: calculator.name,
          medicoOnly: calculator.medicoOnly,
          preferredCalculator: preferredCalculatorIds.has(calculator.id)
        }))
      })),
      preferencesApplied: hasPreferences,
      nextStep: 'Solicite uma calculadora especifica, por exemplo: "abrir SNOT-22", "calcular Epworth" ou "TNM laringe".',
      readOnly: true,
      executesCalculation: false,
      persistsData: false
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'deeplink',
      containsPhi: false
    }
  };
}

function autolaudoDeepLink(request: AdapterRequest): AdapterResponse {
  const module = getModuleById(request.moduleId);
  const examType = inferAutolaudoExamType(request.input.text ?? '');
  const baseUrl = module?.currentUrl ?? 'https://otto-laudo-ia.vercel.app';
  const plannedDeepLinkUrl = buildUrl(baseUrl, { examType });

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'OTTO Laudo-IA preparado em modo seguro. O Concierge abre o modulo e seleciona o tipo de exame; o medico revisa antes de salvar.',
    redactionLevel: 'partial',
    payload: {
      kind: 'deeplink',
      examType,
      url: baseUrl,
      plannedDeepLinkUrl,
      currentBehavior: 'opens_module_with_context_pending_native_route_support',
      requiresNativeDeepLinkSupport: true,
      readOnly: true,
      generatesReportAutomatically: false,
      persistsData: false,
      requiresMedicalReview: true,
      postMessage: {
        type: 'otto-autolaudo-open',
        examType
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'deeplink',
      containsPhi: false
    }
  };
}

function prottoDeepLink(request: AdapterRequest): AdapterResponse {
  const module = getModuleById(request.moduleId);
  const protocolQuery = extractSafeClinicalQuery(request.input.text ?? '', [
    'abrir',
    'buscar',
    'busque',
    'conduta',
    'fluxo',
    'no',
    'prontuario',
    'protocolo',
    'protto'
  ]);
  const baseUrl = module?.currentUrl ?? 'https://otto-protto.vercel.app';
  const plannedDeepLinkUrl = buildUrl(baseUrl, { prottoQuery: protocolQuery, prottoMode: 'protocol' });

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'PROTTO preparado em modo seguro. O Concierge abre o modulo para revisao medica; nenhuma triagem ou prontuario e alterado automaticamente.',
    redactionLevel: 'partial',
    payload: {
      kind: 'deeplink',
      protocolQuery,
      mode: 'protocol',
      url: baseUrl,
      plannedDeepLinkUrl,
      currentBehavior: 'opens_protto_default_until_native_route_support',
      requiresNativeDeepLinkSupport: true,
      readOnly: true,
      opensPatientRecord: false,
      persistsData: false,
      requiresMedicalReview: true,
      postMessage: {
        type: 'otto-protto-open',
        mode: 'protocol',
        query: protocolQuery
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'deeplink',
      containsPhi: false
    }
  };
}

function casesDeepLink(request: AdapterRequest): AdapterResponse {
  const module = getModuleById(request.moduleId);
  const baseUrl = module?.currentUrl ?? 'https://otto-cases.vercel.app/';
  const draftText = extractSafeClinicalQuery(request.input.text ?? '', [
    'criar', 'relato', 'caso', 'report', 'rascunho', 'clinico', 'gerar', 'de'
  ]);
  const plannedDeepLinkUrl = buildUrl(baseUrl, { draft: draftText });

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'OTTO Cases preparado. O Concierge abrira o modulo e pre-preenchera o Intake Inteligente com o rascunho.',
    redactionLevel: 'strict',
    payload: {
      kind: 'deeplink',
      draftText,
      url: baseUrl,
      plannedDeepLinkUrl,
      postMessage: {
        type: 'otto-cases-open',
        draft: draftText
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'deeplink',
      containsPhi: true
    }
  };
}

function procodReadOnlyDeepLink(request: AdapterRequest): AdapterResponse {
  const module = getModuleById(request.moduleId);
  const query = extractProcodQuery(request.input.text ?? '');
  const queryKind = inferProcodQueryKind(request.input.text ?? '');
  const baseUrl = module?.currentUrl ?? 'https://ottoprocod.vercel.app/';
  const url = buildProcodUrl(baseUrl, query, queryKind);

  return {
    status: 'success',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'Busca PROCOD preparada em modo read-only. Confira o codigo no modulo antes de usar em documento ou faturamento.',
    redactionLevel: 'partial',
    payload: {
      kind: 'search',
      query,
      queryKind,
      url,
      readOnly: true,
      safeForZap: true,
      fillsClinicalDocument: false,
      persistsData: false,
      requiresReviewBeforeBilling: true,
      postMessage: {
        type: 'otto-procod-search',
        query,
        context: queryKind === 'cid' ? 'diagnostics' : 'procedures'
      }
    },
    debug: {
      traceId: request.traceId,
      adapterStatus: 'read_only',
      containsPhi: false
    }
  };
}

function errorResponse(request: AdapterRequest, summary: string): AdapterResponse {
  return {
    status: 'error',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary,
    redactionLevel: 'partial',
    debug: {
      traceId: request.traceId,
      adapterStatus: 'mock',
      containsPhi: false
    }
  };
}

function timeoutResponse(request: AdapterRequest): AdapterResponse {
  return {
    status: 'timeout',
    moduleId: request.moduleId,
    intentId: request.intentId,
    summary: 'Adapter demorou para responder; use fallback seguro.',
    redactionLevel: 'partial',
    debug: {
      traceId: request.traceId,
      adapterStatus: 'mock',
      containsPhi: false
    }
  };
}

function buildCalcHubUrl(baseUrl: string, targetTab: string): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl.replace(/#.*$/, '')}${separator}ottoCalculator=${encodeURIComponent(targetTab)}#${encodeURIComponent(targetTab)}`;
}

function inferProcodQueryKind(text: string): 'cid' | 'tuss' | 'cbhpm' | 'procedure' {
  const normalized = normalizeBasic(text);
  if (/\bcid\b|cid-10/.test(normalized)) return 'cid';
  if (/\btuss\b/.test(normalized)) return 'tuss';
  if (/\bcbhpm\b/.test(normalized)) return 'cbhpm';
  return 'procedure';
}

function extractProcodQuery(text: string): string {
  const withoutPhiTail = text.replace(/\b(paciente|nome|cpf|token)\b.*$/iu, '');
  const normalized = withoutPhiTail
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cleaned = normalized
    .replace(/^(qual|buscar|busque|procure|codigo|codigos|procedimento)\s+/iu, '')
    .replace(/\b(qual|buscar|busque|procure|codigo|codigos|procedimento|para|de)\b/giu, ' ')
    .replace(/\b(cid|cid-10|tuss|cbhpm|procod)\b/giu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || normalized || 'busca';
}

function buildProcodUrl(baseUrl: string, query: string, queryKind: string): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  const context = queryKind === 'cid' ? 'diagnostics' : 'procedures';
  return `${baseUrl.replace(/#.*$/, '')}${separator}procodQuery=${encodeURIComponent(query)}&procodContext=${encodeURIComponent(context)}#busca`;
}

function buildUrl(baseUrl: string, params: Record<string, string>): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  const query = new URLSearchParams(params).toString();
  return `${baseUrl.replace(/#.*$/, '')}${separator}${query}`;
}

function inferAutolaudoExamType(text: string): 'videolaringoscopia' | 'videoendoscopia_nasal' | 'nasofibrolaringoscopia' {
  const normalized = normalizeBasic(text);
  if (normalized.includes('nasofibro')) return 'nasofibrolaringoscopia';
  if (normalized.includes('nasal') || normalized.includes('endoscopia')) return 'videoendoscopia_nasal';
  return 'videolaringoscopia';
}

function extractSafeClinicalQuery(text: string, stopWords: string[]): string {
  const withoutPhiTail = text.replace(/\b(paciente|nome|cpf|token|telefone|nascimento)\b.*$/iu, '');
  const normalized = withoutPhiTail
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stop = new Set(stopWords);
  const cleaned = normalized
    .split(' ')
    .filter((word) => !stop.has(word.toLowerCase()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'protocolo ORL';
}

function normalizeBasic(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
