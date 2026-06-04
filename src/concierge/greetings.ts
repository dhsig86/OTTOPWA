import type { OttoProfile } from './types';

// ─── Contexto para gerar saudação ────────────────────────────────────────────

export interface GreetingContext {
  userName: string;
  profile: OttoProfile | null;
  hour: number;
  unreadPills: number;
  lastModule?: string;
  totalPillsRead: number;
  favoritesCount: number;
}

export interface ConciergeGreeting {
  message: string;
  emoji: string;
  suggestions: ConciergeQuickSuggestion[];
}

export interface ConciergeQuickSuggestion {
  label: string;
  command: string;
  icon: string;
}

// ─── Motor de saudações ──────────────────────────────────────────────────────

function getTimeGreeting(hour: number): { greeting: string; emoji: string } {
  if (hour >= 5 && hour < 12) return { greeting: 'Bom dia', emoji: '☀️' };
  if (hour >= 12 && hour < 18) return { greeting: 'Boa tarde', emoji: '🌤️' };
  if (hour >= 18 && hour < 22) return { greeting: 'Boa noite', emoji: '🌙' };
  return { greeting: 'Olá', emoji: '🌟' };
}

function getFirstName(fullName: string): string {
  const name = fullName?.trim().split(' ')[0] || 'Doutor(a)';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getProfileTitle(profile: OttoProfile | null): string {
  switch (profile) {
    case 'medico': return 'Dr(a).';
    case 'estudante': return '';
    case 'profissional': return '';
    default: return '';
  }
}

function buildContextTips(ctx: GreetingContext): string[] {
  const tips: string[] = [];

  if (ctx.unreadPills > 0) {
    tips.push(`📰 ${ctx.unreadPills} pílula${ctx.unreadPills > 1 ? 's' : ''} científica${ctx.unreadPills > 1 ? 's' : ''} nova${ctx.unreadPills > 1 ? 's' : ''} para você`);
  }

  if (ctx.totalPillsRead > 0 && ctx.totalPillsRead % 5 === 0) {
    tips.push(`🏆 Parabéns! ${ctx.totalPillsRead} pílulas lidas — cérebro afiado!`);
  }

  if (ctx.lastModule) {
    const moduleNames: Record<string, string> = {
      calc: 'Calculadoras', procod: 'PROCOD', protto: 'PROTTO',
      autolaudo: 'Laudo-IA', cases: 'Cases', logbook: 'LogBook',
      whisper: 'Whisper', info: 'OTTO NEWS', bottok: 'BOTTOK',
      triagem: 'Triagem', atlas: 'Atlas', otoscopia: 'Otoscop.IA',
      aerodig: 'Aerodigestivo', imune: 'Imunobiológicos', check: 'CHECK Auditivo',
      zumbido: 'Terapia Zumbido', voice: 'VOICE', games: 'Games',
      ottotests: 'Acadêmico', periop: 'PeriOp', videos: 'Vídeos',
      ottosig: 'Glossário', ocr: 'OCR', feedback: 'Feedback',
    };
    const moduleName = moduleNames[ctx.lastModule] || ctx.lastModule;
    tips.push(`↩️ Quer voltar ao ${moduleName}?`);
  }

  // Dica ORL do dia — curiosidades rotativas
  const ORL_DAILY_TIPS = [
    '💡 Dica ORL: O estribo (≈3mm) é o menor osso do corpo humano!',
    '💡 Dica ORL: O nariz produz quase 1 litro de muco por dia.',
    '💡 Dica ORL: Um espirro expele ar a até 160 km/h!',
    '💡 Dica ORL: A cóclea tem formato de caracol — do grego \"kochlos\".',
    '💡 Dica ORL: A fala humana ocorre entre 250 e 4000 Hz.',
    '💡 Dica ORL: Os ossículos auditivos já estão formados ao nascer!',
    '💡 Dica ORL: Temos ~10 milhões de receptores olfativos.',
    '💡 Dica ORL: O cerume protege contra bactérias e fungos.',
    '💡 Dica ORL: O reflexo vestíbulo-ocular estabiliza sua visão ao andar.',
    '💡 Dica ORL: Desvio de septo afeta ~80% da população.',
  ];
  const dayIdx = Math.floor(Date.now() / 86400000) % ORL_DAILY_TIPS.length;
  tips.push(ORL_DAILY_TIPS[dayIdx]);

  return tips;
}

function buildSuggestions(ctx: GreetingContext): ConciergeQuickSuggestion[] {
  const suggestions: ConciergeQuickSuggestion[] = [];

  // Always show "What can I do?"
  suggestions.push({
    label: 'O que posso fazer?',
    command: 'ajuda',
    icon: '❓'
  });

  // Context-specific suggestions
  if (ctx.unreadPills > 0) {
    suggestions.push({
      label: 'Ver pílulas novas',
      command: 'abrir update',
      icon: '📰'
    });
  }

  if (ctx.profile === 'medico') {
    suggestions.push({
      label: 'Calculadora ORL',
      command: 'quais calculadoras',
      icon: '🧮'
    });
    suggestions.push({
      label: 'Preparar laudo',
      command: 'abrir autolaudo',
      icon: '📋'
    });
  }

  if (ctx.profile === 'estudante') {
    suggestions.push({
      label: 'Praticar simulado',
      command: 'abrir simulados',
      icon: '📝'
    });
    suggestions.push({
      label: 'Vídeos ORL',
      command: 'abrir videos',
      icon: '🎬'
    });
  }

  if (ctx.lastModule) {
    suggestions.push({
      label: `Voltar: ${ctx.lastModule}`,
      command: `abrir ${ctx.lastModule}`,
      icon: '↩️'
    });
  }

  return suggestions.slice(0, 4);
}

export function generateGreeting(ctx: GreetingContext): ConciergeGreeting {
  const { greeting, emoji } = getTimeGreeting(ctx.hour);
  const title = getProfileTitle(ctx.profile);
  const firstName = getFirstName(ctx.userName);
  const tips = buildContextTips(ctx);

  const nameStr = title ? `${title} ${firstName}` : firstName;
  let message = `${greeting}, ${nameStr}! Como posso ajudar?`;

  if (tips.length > 0) {
    message += '\n\n' + tips.join('\n');
  }

  return {
    message,
    emoji,
    suggestions: buildSuggestions(ctx),
  };
}
