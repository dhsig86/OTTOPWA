import type { ModuleRegistryEntry } from './types';

export interface CalcHubCalculator {
  id: string;
  name: string;
  area: string;
  aliases: string[];
  medicoOnly: boolean;
}

export const CALC_HUB_AREA_ORDER = [
  'Rinologia',
  'Oncologia',
  'Otologia',
  'Hipoacusia',
  'Laringologia',
  'Sono',
  'Intensiva',
  'Geral',
  'Aerodigestivo'
] as const;

export const CALC_HUB_CATALOG: CalcHubCalculator[] = [
  { id: 'sinusite', name: 'Sinusite', area: 'Rinologia', medicoOnly: false, aliases: ['sinusite', 'rinossinusite', 'epos', 'aao-hns'] },
  { id: 'nose', name: 'NOSE', area: 'Rinologia', medicoOnly: false, aliases: ['nose', 'obstrucao nasal', 'escala nose'] },
  { id: 'lund', name: 'Lund-Mackay', area: 'Rinologia', medicoOnly: false, aliases: ['lund', 'lund mackay', 'lund-mackay', 'tomografia seios da face'] },
  { id: 'snot22', name: 'SNOT-22', area: 'Rinologia', medicoOnly: false, aliases: ['snot', 'snot22', 'snot-22'] },
  { id: 'sn5', name: 'SN-5 Pediatrico', area: 'Rinologia', medicoOnly: false, aliases: ['sn5', 'sn-5', 'sinusite pediatrica'] },
  { id: 'tnm', name: 'TNM Oncologico', area: 'Oncologia', medicoOnly: true, aliases: ['tnm', 'tnm laringe', 'tnm oncologico', 'estadiamento'] },
  { id: 'malig', name: 'Malignidade Cervical', area: 'Oncologia', medicoOnly: true, aliases: ['malignidade cervical', 'massa cervical', 'risco cervical'] },
  { id: 'thi', name: 'THI - Zumbido', area: 'Otologia', medicoOnly: false, aliases: ['thi', 'zumbido', 'tinnitus handicap'] },
  { id: 'dhi', name: 'DHI - Tontura', area: 'Otologia', medicoOnly: false, aliases: ['dhi', 'tontura', 'dizziness handicap', 'vertigem'] },
  { id: 'nciq', name: 'NCIQ - Implante', area: 'Otologia', medicoOnly: false, aliases: ['nciq', 'implante coclear', 'cochlear'] },
  { id: 'comq12', name: 'COMQ-12 - OMC', area: 'Otologia', medicoOnly: false, aliases: ['comq', 'comq12', 'comq-12', 'otite media cronica', 'omc'] },
  { id: 'hhia', name: 'HHIA-S - Desvantagem Auditiva', area: 'Hipoacusia', medicoOnly: false, aliases: ['hhia', 'hhia-s', 'desvantagem auditiva'] },
  { id: 'pta', name: 'PTA - Media Tonal Pura', area: 'Hipoacusia', medicoOnly: false, aliases: ['pta', 'media tonal', 'media tonal pura', 'audiometria'] },
  { id: 'srt', name: 'SRT+IRF - Logoaudiometria', area: 'Hipoacusia', medicoOnly: false, aliases: ['srt', 'irf', 'srt irf', 'logoaudiometria'] },
  { id: 'vhi10', name: 'VHI-10 - Voz', area: 'Laringologia', medicoOnly: false, aliases: ['vhi', 'vhi10', 'vhi-10', 'voice index', 'voice handicap', 'desvantagem vocal'] },
  { id: 'eat10', name: 'EAT-10 - Disfagia', area: 'Laringologia', medicoOnly: false, aliases: ['eat10', 'eat-10', 'disfagia'] },
  { id: 'refluxo', name: 'RSI - Refluxo', area: 'Laringologia', medicoOnly: false, aliases: ['rsi', 'refluxo', 'refluxo laringofaringeo'] },
  { id: 'voiss', name: 'VoiSS - Sintomas', area: 'Laringologia', medicoOnly: false, aliases: ['voiss', 'voice symptom', 'sintomas vocais'] },
  { id: 'epworth', name: 'Epworth - ESE', area: 'Sono', medicoOnly: false, aliases: ['epworth', 'ese', 'sonolencia', 'sonolencia diurna'] },
  { id: 'stopbang', name: 'STOP-Bang', area: 'Sono', medicoOnly: false, aliases: ['stop bang', 'stop-bang', 'stopbang', 'apneia sono'] },
  { id: 'cpss', name: 'CPSS - Pneumonia', area: 'Intensiva', medicoOnly: true, aliases: ['cpss', 'pneumonia', 'traqueostomia pneumonia'] },
  { id: 'centor', name: 'Centor - Faringite', area: 'Geral', medicoOnly: false, aliases: ['centor', 'mcisaac', 'faringite', 'amigdalite'] },
  { id: 'pediatria', name: 'Doses Pediatricas', area: 'Geral', medicoOnly: false, aliases: ['doses pediatricas', 'dose pediatrica', 'pediatria'] },
  { id: 'myercotton', name: 'Myer-Cotton - Estenose Subglotica', area: 'Aerodigestivo', medicoOnly: false, aliases: ['myer cotton', 'myer-cotton', 'estenose subglotica'] },
  { id: 'pedieat10', name: 'Pedi-EAT-10 - Disfagia Pediatrica', area: 'Aerodigestivo', medicoOnly: false, aliases: ['pedi eat', 'pedi-eat-10', 'pedieat10', 'disfagia pediatrica'] },
  { id: 'trachconverter', name: 'Conversor de Canulas', area: 'Aerodigestivo', medicoOnly: false, aliases: ['conversor de canulas', 'canula', 'traqueostomia', 'trach converter'] }
];

export function getCalcHubCatalogByArea(): Array<{ area: string; calculators: CalcHubCalculator[] }> {
  return CALC_HUB_AREA_ORDER.map((area) => ({
    area,
    calculators: CALC_HUB_CATALOG.filter((calculator) => calculator.area === area)
  })).filter((group) => group.calculators.length > 0);
}

function levenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function getSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshteinDistance(a, b);
  return 1.0 - distance / maxLength;
}

export function findCalcHubCalculator(text: string): CalcHubCalculator | undefined {
  const normalizedText = normalizeSearchText(text);
  const wordsText = normalizedText.split(' ').filter((w) => w.length > 2);

  const candidates = CALC_HUB_CATALOG.flatMap((calculator) => (
    [calculator.id, calculator.name, ...calculator.aliases].map((label) => ({
      calculator,
      label: normalizeSearchText(label)
    }))
  ))
    .filter((candidate) => candidate.label.length > 0)
    .sort((a, b) => b.label.length - a.label.length);

  // First pass: exact substring match
  const exactMatch = candidates.find((candidate) => normalizedText.includes(candidate.label));
  if (exactMatch) return exactMatch.calculator;

  // Second pass: fuzzy word-by-word match
  for (const candidate of candidates) {
    const candidateWords = candidate.label.split(' ').filter((w) => w.length > 2);
    if (candidateWords.length === 0) continue;

    const matchesAll = candidateWords.every((cWord) => {
      return wordsText.some((wText) => {
        if (wText === cWord) return true;
        // Substring / extra character check
        if (wText.includes(cWord) && wText.length - cWord.length <= 1) return true;
        if (cWord.includes(wText) && cWord.length - wText.length <= 1) return true;
        // Levenshtein check for longer words
        if (cWord.length >= 4 && wText.length >= 4) {
          return getSimilarity(cWord, wText) >= 0.8;
        }
        return false;
      });
    });

    if (matchesAll) {
      return candidate.calculator;
    }
  }

  return undefined;
}

export const OTTO_MODULE_REGISTRY: ModuleRegistryEntry[] = [
  {
    id: 'calc',
    displayName: 'Calculadoras',
    currentUrl: 'https://otto-calc-hub.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'low',
    capabilities: ['calc.find', 'calc.open', 'calc.run'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'deeplink', timeoutMs: 1500 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'procod',
    displayName: 'CID & TUSS',
    currentUrl: 'https://procod.drdariohart.com/',
    category: 'operacional',
    profiles: ['medico', 'estudante'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'low',
    capabilities: ['procod.search_code', 'procod.open'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'read_only', timeoutMs: 1500 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'ocr',
    displayName: 'OTTO OCR',
    currentUrl: 'https://otto-ocr-web.vercel.app',
    category: 'clinico',
    profiles: ['medico', 'estudante'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'phi',
    capabilities: ['ocr.extract'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'mock', timeoutMs: 5000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'videos',
    displayName: 'Videos',
    currentUrl: '/modules/videos',
    category: 'educacao_paciente',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['video.search'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'mock', timeoutMs: 1000 },
    policies: {
      requiresAuth: false,
      allowsIframe: false,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'bottok',
    displayName: 'BOTTOK',
    currentUrl: 'https://bottok-orcin.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional'],
    status: 'live',
    clinicalRisk: 'variable',
    dataSensitivity: 'low',
    capabilities: ['bottok.ask'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'mock', timeoutMs: 5000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'whisper',
    displayName: 'OTTO Whisper',
    currentUrl: 'https://otto-whisper.netlify.app',
    category: 'clinico',
    profiles: ['medico'],
    status: 'beta',
    clinicalRisk: 'high',
    dataSensitivity: 'high_phi',
    capabilities: ['whisper.transcribe'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'mock', timeoutMs: 10000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'autolaudo',
    displayName: 'OTTO Laudo-IA',
    currentUrl: 'https://otto-laudo-ia.vercel.app',
    category: 'clinico',
    profiles: ['medico'],
    status: 'beta',
    clinicalRisk: 'medium',
    dataSensitivity: 'phi',
    capabilities: ['autolaudo.open', 'autolaudo.prepare_report'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'deeplink', timeoutMs: 1500 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'cases',
    displayName: 'OTTO Cases',
    currentUrl: 'https://otto-cases.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'phi',
    capabilities: ['cases.create_draft'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'deeplink', timeoutMs: 5000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'protto',
    displayName: 'PROTTO',
    currentUrl: 'https://otto-protto.vercel.app',
    category: 'clinico',
    profiles: ['medico'],
    status: 'beta',
    clinicalRisk: 'high',
    dataSensitivity: 'high_phi',
    capabilities: ['protto.search_protocol', 'protto.open'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'mock', timeoutMs: 5000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'aerodig',
    displayName: 'Aerodigestive',
    currentUrl: 'https://otto-aerodig.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional'],
    status: 'beta',
    clinicalRisk: 'medium',
    dataSensitivity: 'low',
    capabilities: ['aerodig.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'logbook',
    displayName: 'OTTO Log',
    currentUrl: 'https://otto-log.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'low',
    capabilities: ['logbook.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'imune',
    displayName: 'Imunobiológicos',
    currentUrl: 'https://otto-imune.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'low',
    capabilities: ['imune.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: true
    }
  },
  {
    id: 'ottotests',
    displayName: 'OTTO Acadêmico',
    currentUrl: 'https://test-pg-bice.vercel.app/',
    category: 'operacional',
    profiles: ['medico', 'estudante', 'profissional'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['ottotests.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: true,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'check',
    displayName: 'OTTO Check',
    currentUrl: 'https://otto-check.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'beta',
    clinicalRisk: 'low',
    dataSensitivity: 'low',
    capabilities: ['check.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'zumbido',
    displayName: 'Zumbido',
    currentUrl: 'https://otto-check.vercel.app/?tool=zumbido',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['zumbido.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'voice',
    displayName: 'Voz',
    currentUrl: 'https://otto-voice-one.vercel.app/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'low',
    capabilities: ['voice.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'atlas',
    displayName: 'Atlas ORL',
    currentUrl: 'https://atlas.drdariohart.com/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['atlas.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'otoscopia',
    displayName: 'Otoscop.IA',
    currentUrl: 'https://atlas.drdariohart.com/?tab=ia&embed=true',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'low',
    capabilities: ['otoscopia.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: true,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'info',
    displayName: 'OTTO Update',
    currentUrl: '/modules/info',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['info.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: false,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'ottosig',
    displayName: 'OTTO Glossário',
    currentUrl: 'https://dhsig86.github.io/minidic/',
    category: 'educacao_paciente',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['ottosig.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: false,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'periop',
    displayName: 'Peri-op',
    currentUrl: '/modules/periop',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['periop.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: false,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'games',
    displayName: 'OTTO Games',
    currentUrl: 'https://otto-games.vercel.app/',
    category: 'educacao_paciente',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['games.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'feedback',
    displayName: 'Feedback',
    currentUrl: '/modules/feedback',
    category: 'operacional',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'low',
    dataSensitivity: 'none',
    capabilities: ['feedback.open'],
    surfaces: ['pwa', 'test'],
    adapter: { status: 'mock', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: false,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  },
  {
    id: 'triagem',
    displayName: 'Triagem OS',
    currentUrl: 'https://otto-ai-triagem-1fc48c3c292e.herokuapp.com/',
    category: 'clinico',
    profiles: ['medico', 'estudante', 'profissional', 'paciente'],
    status: 'live',
    clinicalRisk: 'medium',
    dataSensitivity: 'phi',
    capabilities: ['triagem.open', 'triagem.start'],
    surfaces: ['pwa', 'zap', 'test'],
    adapter: { status: 'deeplink', timeoutMs: 3000 },
    policies: {
      requiresAuth: false,
      allowsIframe: true,
      supportsDeepLink: true,
      supportsPostMessage: false,
      requiresConfirmationForPersist: false
    }
  }
];

export function getModuleById(moduleId: string): ModuleRegistryEntry | undefined {
  return OTTO_MODULE_REGISTRY.find((module) => module.id === moduleId);
}

function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
