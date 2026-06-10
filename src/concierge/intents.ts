import { CALC_HUB_CATALOG } from './registry';
import type { IntentCandidate, IntentRegistryEntry } from './types';

const BROAD_CLINICAL_CALC_ALIASES = new Set([
  'sinusite',
  'rinossinusite',
  'faringite',
  'amigdalite',
  'disfagia',
  'refluxo',
  'pneumonia',
  'traqueostomia pneumonia',
  'traqueostomia',
  'canula',
  'otite media cronica',
  'vertigem',
  'tontura',
  'zumbido',
  'sonolencia',
  'sonolencia diurna',
  'apneia sono',
  'massa cervical',
  'estadiamento',
  'pediatria',
  'audiometria',
  'implante coclear',
  'cochlear',
  'tomografia seios da face'
]);

export const CLINICAL_INTENTS: IntentRegistryEntry[] = [
  intent('calc.list', 'Listar calculadoras', 'calc', 'respond', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'], false, false, 'low', [
    'quais calculadoras',
    'lista de calculadoras',
    'mostrar calculadoras',
    'calculadoras disponiveis',
    'menu calculadoras',
    'abrir calculadora',
    'calculadora'
  ]),
  intent('calc.open', 'Abrir calculadora', 'calc', 'deep_link', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'], false, false, 'low', [...calcOpenExamples(), 'snot-22', 'epworth', 'dhi', 'tnm', 'house-brackmann', 'comq-12', 'centor']),
  intent('procod.search_code', 'Buscar codigo PROCOD', 'procod', 'call_tool', 'medium', ['medico', 'estudante'], ['pwa', 'zap', 'test'], false, false, 'low', [
    'cid rinossinusite',
    'tuss septoplastia',
    'cbhpm timpanoplastia',
    'codigo amigdalectomia',
    'procedimento adenoidectomia'
  ]),
  intent('ocr.extract', 'Extrair documento', 'ocr', 'call_tool', 'medium', ['medico', 'estudante'], ['pwa', 'zap', 'test'], true, false, 'phi', [
    'ler laudo',
    'ler esse laudo',
    'extrair texto',
    'ocr exame',
    'ocr imagem',
    'ler pdf',
    'transformar imagem em texto'
  ]),
  intent('video.search', 'Buscar video', 'videos', 'respond', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'], false, false, 'none', [
    'video adenoide',
    'aula otoscopia',
    'explicacao sinusite',
    'video epistaxe',
    'youtube'
  ]),
  intent('bottok.ask', 'Perguntar ao BOTTOK', 'bottok', 'call_tool', 'variable', ['medico', 'estudante', 'profissional'], ['pwa', 'zap', 'test'], false, false, 'low', [
    'duvida orl',
    'perguntar bottok',
    'red flags otite',
    'diferencial vertigem',
    'disfonia persistente',
    'o que é otosclerose',
    'como tratar epistaxe',
    'dose de amoxicilina para OMA'
  ]),
  intent('whisper.transcribe', 'Transcrever consulta', 'whisper', 'handoff_to_pwa', 'high', ['medico'], ['pwa', 'zap', 'test'], true, false, 'high_phi', [
    'transcrever consulta',
    'audio da consulta',
    'ditar evolucao',
    'resumir audio',
    'escrivao medico',
    'abrir whisper',
    'otto whisper',
    'gravar consulta',
    'iniciar transcricao'
  ]),
  intent('autolaudo.prepare_report', 'Preparar laudo no OTTO Laudo-IA', 'autolaudo', 'deep_link', 'medium', ['medico'], ['pwa', 'zap', 'test'], false, false, 'low', [
    'abrir laudo ia',
    'abrir autolaudo',
    'otto laudo ia',
    'laudo por ia',
    'laudo por voz',
    'preparar laudo',
    'laudo videolaringoscopia',
    'laudo video laringoscopia',
    'laudo videoendoscopia nasal',
    'laudo video endoscopia nasal',
    'laudo nasofibrolaringoscopia',
    'laudo nasofibro',
    'laudo endoscopia nasal',
    'modelo de laudo orl'
  ]),
  intent('cases.create_draft', 'Criar rascunho de caso', 'cases', 'call_tool', 'medium', ['medico', 'estudante'], ['pwa', 'test'], true, false, 'phi', [
    'criar relato de caso',
    'case report',
    'rascunho de caso',
    'montar caso clinico',
    'gerar caso',
    'relato de caso ORL',
    'caso clinico de otite',
    'publicar caso de sinusite'
  ]),
  intent('protto.search_protocol', 'Buscar protocolo PROTTO', 'protto', 'deep_link', 'medium', ['medico'], ['pwa', 'zap', 'test'], false, false, 'low', [
    'protocolo rinossinusite',
    'fluxo epistaxe',
    'abrir protto',
    'protocolo amigdalite',
    'conduta otite',
    'prontuario protto',
    'abrir prontuario',
    'protocolo epistaxe',
    'protocolo otite',
    'protocolo disfonia',
    'protocolo vertigem',
    'protocolo apneia',
    'buscar protocolo no protto',
    'protocolo de sinusite',
    'conduta para otite',
    'tratamento de rinite',
    'guideline de VPPB'
  ]),
  intent('procod.open', 'Abrir CID & TUSS', 'procod', 'open_module', 'low', ['medico', 'estudante'], ['pwa', 'test'], false, false, 'none', [
    'abrir procod',
    'procod',
    'gerador de laudos',
    'laudos cirurgicos',
    'faturamento tuss',
    'tuss cid'
  ]),
  intent('cases.open', 'Abrir OTTO Cases', 'cases', 'open_module', 'low', ['medico', 'estudante'], ['pwa', 'test'], false, false, 'none', [
    'abrir cases',
    'cases',
    'relatos de caso',
    'criar relato de caso'
  ]),
  intent('logbook.open', 'Abrir OTTO Log', 'logbook', 'open_module', 'low', ['medico', 'estudante'], ['pwa', 'test'], false, false, 'none', [
    'abrir logbook',
    'abrir log',
    'logbook',
    'casuistica cirurgica',
    'registro cirurgico'
  ]),
  intent('aerodig.open', 'Abrir Aerodigestive', 'aerodig', 'open_module', 'low', ['medico', 'estudante', 'profissional'], ['pwa', 'test'], false, false, 'none', [
    'abrir aerodig',
    'abrir aerodigestive',
    'aerodig',
    'via aerea pediatrica',
    'canulas de traqueostomia'
  ]),
  intent('imune.open', 'Abrir Imunobiológicos', 'imune', 'open_module', 'low', ['medico', 'estudante', 'profissional'], ['pwa', 'test'], false, false, 'none', [
    'abrir imune',
    'abrir imunobiologicos',
    'imunobiologicos',
    'elegibilidade dupilumabe',
    'portal de imunobiologicos'
  ]),
  intent('ottotests.open', 'Abrir OTTO Acadêmico', 'ottotests', 'open_module', 'low', ['medico', 'estudante', 'profissional'], ['pwa', 'test'], false, false, 'none', [
    'abrir academico',
    'abrir simulados',
    'abrir questao',
    'academico',
    'otto academico',
    'questoes de residencia'
  ]),
  intent('check.open', 'Abrir OTTO Check', 'check', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir check',
    'abrir triagem auditiva',
    'otto check',
    'exame de audicao'
  ]),
  intent('zumbido.open', 'Abrir Zumbido', 'zumbido', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir zumbido',
    'zumbido',
    'terapia sonora',
    'ruido branco'
  ]),
  intent('voice.open', 'Abrir Voz', 'voice', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir voz',
    'abrir voice',
    'otto voice',
    'gerador de voz'
  ]),
  intent('atlas.open', 'Abrir Atlas ORL', 'atlas', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir atlas',
    'atlas orl',
    'atlas de otoscopia'
  ]),
  intent('otoscopia.open', 'Abrir Otoscop.IA', 'otoscopia', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir otoscopia',
    'otoscopia ia',
    'classificar otoscopia'
  ]),
  intent('info.open', 'Abrir OTTO NEWS', 'info', 'open_module', 'low', ['medico', 'estudante', 'profissional'], ['pwa', 'test'], false, false, 'none', [
    'abrir update',
    'abrir info',
    'abrir news',
    'otto update',
    'pilulas clinicas',
    'noticias otorrino'
  ]),
  intent('ottosig.open', 'Abrir OTTO Glossário', 'ottosig', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir glossario',
    'abrir minidic',
    'dicionario otorrino',
    'termos otorrino'
  ]),
  intent('periop.open', 'Abrir Peri-op', 'periop', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir periop',
    'pre operatorio',
    'pos operatorio',
    'jejum cirurgico'
  ]),
  intent('games.open', 'Abrir OTTO Games', 'games', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir games',
    'otto games',
    'jogos da saude'
  ]),
  intent('feedback.open', 'Abrir Feedback', 'feedback', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir feedback',
    'reportar bug',
    'sugestoes'
  ]),
  intent('ocr.open', 'Abrir OTTO OCR', 'ocr', 'open_module', 'low', ['medico', 'estudante'], ['pwa', 'test'], false, false, 'none', [
    'abrir ocr',
    'extrator de laudos'
  ]),
  intent('bottok.open', 'Abrir BOTTOK', 'bottok', 'open_module', 'low', ['medico', 'estudante', 'profissional'], ['pwa', 'test'], false, false, 'none', [
    'abrir bottok',
    'conversar com bottok',
    'chatia'
  ]),
  intent('concierge.help', 'Explicar módulo ou ajuda', 'concierge', 'respond', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'], false, false, 'none', [
    'como funciona o sistema',
    'quais modulos existem',
    'o que faz o modulo',
    'me ajuda a usar',
    'quais calculadoras tem',
    'como eu trato meu zumbido',
    'onde vejo o jejum da cirurgia',
    'o que e amigdalectomia',
    'como cadastrar cirurgia',
    'onde fazer teste de audicao',
    'ajuda',
    'socorro',
    'manual',
    'otto ecosystem',
    'otto pwa',
    'capacidades do otto',
    'capacidades do otto ecosystem',
    'capacidades do pwa',
    'funcionalidades do otto',
    'funcionalidades do pwa',
    'o que o otto faz',
    'o que o ecosystem faz',
    'capacidades do ecossistema',
    'o que tem no pwa',
    'modulos do otto'
  ]),
  intent('triagem.open', 'Abrir Triagem', 'triagem', 'open_module', 'low',
    ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'],
    false, false, 'none', [
    'abrir triagem',
    'triagem',
    'triagem os',
    'iniciar triagem',
    'fazer triagem',
    'admissao clinica',
    'protocolo triagem',
    'anamnese ia',
    'triagem do paciente',
    'admissao do paciente',
    'nariz entupido',
    'dor de ouvido',
    'tontura',
    'dor de garganta',
    'ouvido de nadador',
    'ouvido vazando',
    'não consigo ouvir',
    'sangramento nasal',
    'voz rouca',
    'rosto caído',
    'roncando muito',
    'apneia do sono'
  ]),
  intent('profile.open', 'Abrir Perfil', 'profile', 'open_module', 'low',
    ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'],
    false, false, 'none', [
    'abrir perfil',
    'meu perfil',
    'minha conta',
    'meus dados',
    'editar cadastro',
    'editar perfil',
    'configuracoes',
    'exportar dados',
    'baixar dados',
    'lgpd',
    'excluir conta',
    'deletar conta',
    'area do usuario'
  ]),
  intent('fono.open', 'Abrir OTTO Fono', 'fono', 'open_module', 'low', ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'test'], false, false, 'none', [
    'abrir fono',
    'reabilitacao vocal',
    'exercicio de voz',
    'fonoaudiologia',
    'exercicios para apneia',
    'exercicio orofaringe',
    'protocolo de guimaraes',
    'reabilitacao de labirintite',
    'exercicio de tontura',
    'brandt-daroff',
    'lax vox',
    'masako',
    'degluticao segura',
    'treino de fono'
  ]),
  intent('concierge.chat', 'Conversar ou tirar dúvidas', 'concierge', 'respond', 'low',
    ['medico', 'estudante', 'profissional', 'paciente'], ['pwa', 'zap', 'test'],
    false, false, 'none', [
    'conversar',
    'oi',
    'ola',
    'quem e voce'
  ])
];

function calcOpenExamples(): string[] {
  const examples = CALC_HUB_CATALOG.flatMap((calculator) => {
    const labels = [calculator.id, calculator.name, ...calculator.aliases];
    return [
      ...labels.filter(canUseBareCalculatorAlias),
      ...labels.flatMap((label) => [
        `calculadora ${label}`,
        `abrir ${label}`,
        `calcular ${label}`,
        `score ${label}`,
        `escala ${label}`
      ])
    ];
  });

  return Array.from(new Set(examples));
}

function canUseBareCalculatorAlias(alias: string): boolean {
  return !BROAD_CLINICAL_CALC_ALIASES.has(normalizeText(alias));
}

export function classifyIntent(text: string): IntentCandidate[] {
  const normalized = normalizeText(text);

  return CLINICAL_INTENTS.map((intentEntry) => {
    const matchedTerms = intentEntry.examples.filter((example) => matchesExample(normalized, normalizeText(example)));
    const confidence = matchedTerms.length > 0 ? Math.min(0.95, 0.65 + matchedTerms.length * 0.15) : 0;
    return { intent: intentEntry, confidence, matchedTerms };
  })
    .filter((candidate) => candidate.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || matchedSpecificity(b) - matchedSpecificity(a));
}

export async function classifyIntentWithLLM(text: string): Promise<IntentCandidate | null> {
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      console.warn('[Concierge] classify API returned error status:', response.status);
      return null;
    }
    
    const data = await response.json();
    if (data.intentId && data.confidence >= 0.6) {
      const intentEntry = CLINICAL_INTENTS.find(i => i.id === data.intentId);
      if (intentEntry) {
        return {
          intent: intentEntry,
          confidence: data.confidence,
          matchedTerms: data.extractedEntities?.calculatorName 
            ? [data.extractedEntities.calculatorName] 
            : (data.extractedEntities?.searchTerm ? [data.extractedEntities.searchTerm] : []),
          reply: data.reply
        };
      }
    }
    return null;
  } catch (e) {
    console.warn('[Concierge] LLM classification failed. Falling back to local rules.', e);
    return null;
  }
}

function matchedSpecificity(candidate: IntentCandidate): number {
  return candidate.matchedTerms.reduce((total, term) => total + normalizeText(term).length, 0);
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

function matchesExample(normalizedText: string, normalizedExample: string): boolean {
  if (normalizedText.includes(normalizedExample)) return true;

  const tokensText = normalizedText.split(' ').filter((token) => token.length > 2);
  const tokensExample = normalizedExample.split(' ').filter((token) => token.length > 2);
  if (tokensExample.length === 0) return false;

  return tokensExample.every((tokenEx) => {
    if (normalizedText.includes(tokenEx)) return true;

    return tokensText.some((tokenTxt) => {
      if (tokenEx === tokenTxt) return true;

      // Substring/extra character check: "vhii" contains "vhi" or vice versa
      if (tokenEx.length >= 3 && tokenTxt.length >= 3) {
        if (tokenTxt.includes(tokenEx) && tokenTxt.length - tokenEx.length <= 1) return true;
        if (tokenEx.includes(tokenTxt) && tokenEx.length - tokenTxt.length <= 1) return true;
      }

      // Levenshtein threshold (80% similarity) for tokens with >= 4 characters
      if (tokenEx.length >= 4 && tokenTxt.length >= 4) {
        return getSimilarity(tokenEx, tokenTxt) >= 0.8;
      }

      return false;
    });
  });
}


function intent(
  id: string,
  displayName: string,
  moduleId: string,
  actionKind: IntentRegistryEntry['actionKind'],
  riskLevel: IntentRegistryEntry['riskLevel'],
  allowedProfiles: IntentRegistryEntry['allowedProfiles'],
  allowedSurfaces: IntentRegistryEntry['allowedSurfaces'],
  requiresConfirmation: boolean,
  requiresPatientContext: boolean,
  dataSensitivity: IntentRegistryEntry['dataSensitivity'],
  examples: string[]
): IntentRegistryEntry {
  return {
    id,
    displayName,
    description: displayName,
    examples,
    moduleId,
    actionKind,
    riskLevel,
    allowedProfiles,
    allowedSurfaces,
    requiresConfirmation,
    requiresPatientContext,
    dataSensitivity,
    auditPolicy: {
      eventType: `intent.${id}`,
      storePayload: false,
      redactionLevel: dataSensitivity === 'none' || dataSensitivity === 'low' ? 'partial' : 'strict'
    }
  };
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
