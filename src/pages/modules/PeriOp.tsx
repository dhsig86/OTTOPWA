import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Clock, Ear } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ALERT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

const AlertBlock = ({
  color,
  title,
  children,
}: {
  color: 'red' | 'orange' | 'amber';
  title: string;
  children: React.ReactNode;
}) => {
  const map = {
    red:    { bg: 'bg-red-50',    border: 'border-red-600',   icon: 'text-red-600',   text: 'text-red-900',   label: 'text-red-800' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-500',icon: 'text-orange-600',text: 'text-orange-900',label: 'text-orange-900' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-500', icon: 'text-amber-600', text: 'text-amber-900', label: 'text-amber-900' },
  };
  const c = map[color];
  return (
    <div className={`${c.bg} border-l-4 ${c.border} p-3 mt-3 rounded-r flex flex-col gap-1`}>
      <div className="flex items-start gap-2 mb-1">
        <AlertTriangle size={15} className={`${c.icon} shrink-0 mt-0.5`} />
        <strong className={`text-xs ${c.label} uppercase tracking-wide`}>{title}</strong>
      </div>
      <div className={`text-[11.5px] ${c.text} leading-snug ml-6 space-y-1`}>{children}</div>
    </div>
  );
};

// ── Epistaxe / Hematemese ────────────────────────────────────────────────────
const EpistaxeAlert = () => (
  <AlertBlock color="red" title="Alerta Especial — Epistaxe / Hematemese">
    <p><strong>Epistaxe</strong> = sangramento ativo nasal abundante. <strong>Hematemese</strong> = vômito de sangue vivo volumoso. Ambos são urgências.</p>
    <p>1. Sente-se inclinado para frente — <strong>não deite nem jogue a cabeça para trás.</strong></p>
    <p>2. Avise sua equipe cirúrgica imediatamente.</p>
    <p>3. Se não ceder em <strong>10–15 minutos</strong>, dirija-se à emergência hospitalar mais próxima (pública, privada ou convênio).</p>
    <p>4. Leve o documento de alta e o nome da cirurgia realizada. <strong>Não tome remédios por conta própria.</strong></p>
  </AlertBlock>
);

// ─────────────────────────────────────────────────────────────────────────────
// PRÉ-OPERATÓRIO
// ─────────────────────────────────────────────────────────────────────────────

const PRE_PROTOCOLS = [
  {
    id: 'gerais',
    title: 'Orientações Gerais Pré-Operatórias',
    iconColor: 'text-[#2b7a78]',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Agendamento e Documentação</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>A confirmação do agendamento cirúrgico só ocorre após a entrega da <strong>senha de liberação do plano de saúde</strong> à secretaria.</li>
            <li>Traga os exames solicitados no pré-operatório, especialmente exames de imagem (tomografias e ressonâncias).</li>
            <li>O <strong>Termo de Consentimento Cirúrgico</strong> é obrigação legal — leia, assine e entregue no dia da cirurgia.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2 flex items-center gap-2">
            <Clock size={14} /> Jejum e Internação
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Jejum para <strong>sólidos: 8 horas antes</strong> do horário da cirurgia.</li>
            <li>Jejum para <strong>líquidos claros (água, chá sem leite): 2 horas antes</strong> — conforme protocolo do hospital.</li>
            <li>Internação com <strong>2 a 3 horas de antecedência</strong> do horário previsto.</li>
            <li>Tempo médio de internação: <strong>24 horas</strong>. Orientações de alta serão entregues pelo time cirúrgico.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Cuidados Locais Pré-Operatórios</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Para <strong>cirurgias nasais</strong>: recomenda-se retirar bigode e barba previamente ao procedimento.</li>
            <li>Higiene corporal completa na noite ou manhã anterior à cirurgia.</li>
            <li>Não utilize esmalte nas unhas (interfere com oxímetro).</li>
            <li>Deixe joias, relógios e adereços em casa.</li>
          </ul>
        </div>
      </div>
    ),
  },

  {
    id: 'medicacoes',
    title: 'Medicações e Risco Anestésico',
    iconColor: 'text-[#2b7a78]',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Regras Gerais</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong>Não inicie</strong> nenhum medicamento novo na semana da cirurgia sem liberação médica.</li>
            <li>Analgésicos liberados sem prescrição adicional: <strong>Dipirona</strong> e <strong>Paracetamol</strong>.</li>
            <li>Medicações de uso crônico: mantenha ou suspend conforme orientação do <strong>Risco Cirúrgico</strong>.</li>
            <li>Informe <strong>todas as alergias medicamentosas</strong> ao médico anestesista antes do procedimento.</li>
          </ul>
        </div>

        <AlertBlock color="red" title="Anticoagulantes e Anti-inflamatórios — SUSPENDER 7 DIAS ANTES">
          <p>Risco de sangramento cirúrgico grave. Suspender com <strong>7 dias de antecedência</strong>:</p>
          <p>• AAS / Aspirina &nbsp;• Clopidogrel &nbsp;• Warfarina (Marevan)</p>
          <p>• Ibuprofeno &nbsp;• Naproxeno &nbsp;• Diclofenaco &nbsp;• Outros AINEs</p>
          <p>• Ginkgo Biloba e outros fitoterápicos anticoagulantes</p>
          <p className="mt-1 italic">Anticoagulantes de uso obrigatório (ex: fibrilação atrial, prótese valvar): <strong>nunca suspenda sem orientação do cardiologista</strong>.</p>
        </AlertBlock>

        {/* ── GLP-1 ALERT — atualizado 2025 ── */}
        <AlertBlock color="orange" title="ALERTA ANESTÉSICO — Análogos de GLP-1 (Ozempic · Mounjaro · Wegovy · Saxenda · Trulicity)">
          <p>
            Semaglutida, tirzepatida, liraglutida e similares <strong>retardam significativamente o esvaziamento gástrico</strong>.
            Mesmo com jejum adequado, pode haver conteúdo residual no estômago, aumentando o risco de{' '}
            <strong>broncoaspiração</strong> (refluxo gástrico para os pulmões) durante a anestesia geral ou sedação profunda.
          </p>
          <p className="font-bold mt-1">Protocolo de suspensão — diretrizes 2025 (SBA + evidências internacionais):</p>
          <div className="mt-1 space-y-0.5">
            <p>• <strong>Semaglutida</strong> (Ozempic / Wegovy / Rybelsus): suspender <strong>14 a 21 dias antes</strong></p>
            <p>• <strong>Tirzepatida</strong> (Mounjaro): suspender <strong>14 dias antes</strong></p>
            <p>• <strong>Dulaglutida</strong> (Trulicity): suspender <strong>14 dias antes</strong></p>
            <p>• <strong>Liraglutida</strong> (Saxenda / Victoza): suspender <strong>24–48h antes</strong> (ação diária)</p>
            <p>• <strong>Exenatida</strong> (Byetta diária): suspender <strong>no dia da cirurgia</strong></p>
          </div>
          <p className="mt-1.5 font-semibold">
            ⚠️ A suspensão inadequada pode levar ao <strong>cancelamento da cirurgia no dia do procedimento</strong>.
          </p>
          <p className="mt-1 text-[11px] italic">
            Nota 2025: A Sociedade Brasileira de Diabetes recomenda 21 dias para semaglutida considerando sua meia-vida longa (≈7 dias).
            O anestesista poderá solicitar <strong>ultrassonografia gástrica pré-anestésica</strong> para avaliação individualizada.
            Pacientes que interrompem o GLP-1 por diabetes devem monitorar a glicemia com reforço médico neste período.
          </p>
          <p className="mt-2 pt-2 border-t border-orange-200 text-[10px] text-orange-800/60 leading-relaxed">
            📄 <strong>Referências 2025:</strong>{' '}
            AAOS Annual Meeting 2025 — <em>"Stopping GLP-1 Agonists 14 Days Before Surgery Reduces Anesthesia Risks"</em> (Mar/2025).{' '}
            ADS/ANZCA/GESA/NACOS — <em>"Clinical Practice Recommendations on the Peri-Procedural Use of GLP-1/GIP Receptor Agonists"</em>, PMC 2025.
          </p>
        </AlertBlock>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PÓS-OPERATÓRIO
// Conteúdo baseado nos protocolos reais do serviço — dados pessoais removidos.
// ─────────────────────────────────────────────────────────────────────────────

const POST_PROTOCOLS = [
  // ── 1. Amigdalectomia / Adenoidectomia / Uvulopalatoplastia ────────────────
  {
    id: 'adeno',
    title: 'Adenoidectomia / Amigdalectomia / Uvulopalatoplastia',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Alimentação</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Alimentação <strong>branda, líquida ou pastosa e fria</strong> por <strong>7 a 10 dias</strong>.</li>
            <li>A partir do <strong>7º dia</strong>: aumente a consistência e a temperatura progressivamente — líquido → pastoso → sólido de fácil mastigação.</li>
            <li>
              <span className="font-semibold text-red-600">Proibido até liberação médica:</span>{' '}
              alimentos quentes (café, chás), biscoito, pipoca, pedaços de carne, batata frita, pizza.
            </li>
          </ul>
          <p className="font-semibold mt-2 text-[13px] text-gray-600">✅ Alimentos recomendados nas primeiras semanas:</p>
          <ul className="list-disc pl-5 space-y-0.5 text-[13px] mt-1">
            <li>Caldos e sopas passados no liquidificador</li>
            <li>Ovos, carne e peixe picados ou moídos nas sopas ou purê</li>
            <li>Sucos e vitaminas de frutas e vegetais</li>
            <li>Frutas cozidas, assadas ou amassadas</li>
            <li>Arroz bem cozido e purê de legumes (batata, cenoura, abóbora)</li>
            <li>Leguminosas amassadas (feijão, grão-de-bico, lentilha)</li>
            <li>Leite, iogurte, requeijão e ricota</li>
            <li>Mingau de maisena ou aveia</li>
            <li>Miolo de pão umedecido em leite, chá ou caldos</li>
            <li>Água, água de coco, chá gelado</li>
            <li>Gelatina, geleia, pudim, sorvete, manteiga</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Repouso e Atividade Física</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong>Primeiras 24h:</strong> repouso absoluto. Ao se locomover, peça ajuda — tontura e desequilíbrio são comuns.</li>
            <li><strong>Do 2º ao 7º dia:</strong> permaneça em casa em repouso relativo. Evite exposição ao sol e movimentos bruscos com a cabeça.</li>
            <li><strong>Esforço físico e esportes:</strong> proibidos nos primeiros <strong>15 a 30 dias</strong>. Retomada apenas com liberação médica.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados no Pós-Operatório</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Dor de garganta, dor de ouvido (otalgia de reflexo) e cefaleia — normais.</li>
            <li><strong>Placas brancas na garganta:</strong> cicatrização normal. <strong>Não as remova.</strong></li>
            <li>Pequenos sangramentos pela boca e pelo nariz nos primeiros dias.</li>
            <li>Náuseas e vômitos nas primeiras horas — podem ter coloração escura (tipo "borra de café"): resíduo de sangue deglutido na cirurgia. Não é alarmante.</li>
            <li>Tontura, especialmente ao se levantar rapidamente.</li>
          </ul>
        </div>

        <AlertBlock color="red" title="Sinais de alerta — acionar equipe imediatamente">
          <p>🌡️ Febre alta e persistente.</p>
          <p>🩸 Sangramento persistente e/ou de grande quantidade pela boca ou nariz.</p>
        </AlertBlock>

        <EpistaxeAlert />
      </div>
    ),
  },

  // ── 2. Cirurgia Nasal (Septoplastia / FESS / Turbinectomia) ───────────────
  {
    id: 'nasal',
    title: 'Cirurgia Nasal Funcional (Septo / FESS / Turbinas)',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Dieta <strong>livre</strong>, exceto alimentos muito quentes.</li>
            <li>Se a cirurgia foi combinada com procedimento de garganta: siga as orientações dietéticas da cirurgia de garganta.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Repouso e Movimentação</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong>Primeiras 24h:</strong> repouso no leito. Se precisar ir ao banheiro, chame alguém para ajudar.</li>
            <li><strong>Do 2º ao 14º dia:</strong> permaneça em casa, em repouso relativo, sem esforço físico.</li>
            <li>Ao deitar, levantar, abaixar ou sentar, faça os movimentos de forma <strong>lenta e gradual</strong> para evitar tontura e sangramento.</li>
            <li>Não se exponha ao sol. Evite movimentos bruscos com a cabeça.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados com o Nariz</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong className="text-red-600">Não assoe o nariz com força</strong> e <strong>não funge</strong> — pode provocar sangramento ou desfazer a cicatrização interna.</li>
            <li>Ao espirrar ou tossir, faça com a <strong>boca aberta</strong>.</li>
            <li>Não manipule o nariz com os dedos.</li>
            <li>As crostas e coágulos serão retirados com <strong>lavagem com soro fisiológico frio/gelado</strong> — inicie no 2º dia conforme orientado, com volume mínimo de 80 mL por lavagem.</li>
            <li>O restante das crostas será removido nos curativos realizados no consultório.</li>
            <li>Em casos de polipose: pode ser prescrito antibiótico e corticoide <strong>5 a 7 dias antes</strong> para reduzir o sangramento intraoperatório.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Saída de pequena quantidade de sangue escurecido ou secreção rosada pelas fossas nasais — normal nos primeiros dias.</li>
            <li>Tontura e enjoo.</li>
            <li>Cefaleia (dor de cabeça).</li>
            <li>Lacrimejamento.</li>
            <li>Discreta dor e pressão nos ouvidos.</li>
          </ul>
        </div>

        <AlertBlock color="red" title="Sinais de alerta — acionar equipe imediatamente">
          <p>🩸 Sangramento excessivo e/ou recorrente pelo nariz.</p>
          <p>🌡️ Febre alta.</p>
          <p>😰 Mal-estar súbito ou intenso.</p>
          <p className="mt-1">Sangramento tardio entre o 7º e o 14º dia é comum (desprendimento da crosta cicatricial) — siga o protocolo de epistaxe abaixo.</p>
        </AlertBlock>

        <EpistaxeAlert />
      </div>
    ),
  },

  // ── 3. Micro-cirurgia de Laringe ──────────────────────────────────────────
  {
    id: 'laringe',
    title: 'Micro-cirurgia de Laringe',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Alimentação</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Evite alimentos <strong>muito quentes e ácidos</strong> — podem prejudicar a cicatrização da ferida cirúrgica.</li>
            <li>
              <span className="font-semibold text-red-600">Proibido:</span>{' '}
              bebidas alcoólicas, refrigerantes, café, leite, chá preto, pimenta e qualquer alimento irritante ou condimentado.
            </li>
            <li>Beba bastante líquido à <strong>temperatura ambiente</strong>.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">⭐ Repouso Vocal — Fundamental para o Resultado</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong>Nos 7 primeiros dias: repouso vocal ABSOLUTO.</strong> Não fale nada — nem sussurre. O sussurro é tão lesivo à corda vocal quanto falar.</li>
            <li>Nas semanas seguintes: diminua ao máximo o uso da voz progressivamente.</li>
            <li>Não cante, não grite, não fale muito depressa ou com emoção.</li>
            <li>Evite pigarrear ou rir muito — geram trauma nas cordas vocais.</li>
            <li>É <strong>normal ficar rouco</strong> por aproximadamente <strong>15 a 30 dias</strong> após a cirurgia (variável conforme a patologia operada).</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Repouso Físico</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Não realize atividades físicas nas <strong>primeiras 48h</strong>.</li>
            <li>Durma com o <strong>travesseiro elevado</strong> (cabeça em posição mais alta que o tronco) para reduzir refluxo e edema.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Ambiente e Estilo de Vida</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><span className="font-semibold text-red-600">Não fume.</span> O cigarro é o maior inimigo da cicatrização laríngea.</li>
            <li>Evite ficar em ambientes poluídos, ruidosos ou com irritantes: <strong>giz, ar-condicionado intenso, fumaça, produtos de limpeza, perfumes</strong>.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Medicação e Retornos</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Siga rigorosamente a medicação prescrita. Muito do resultado funcional da cirurgia depende deste cuidado.</li>
            <li><strong>Não falte aos retornos.</strong> O acompanhamento pós-operatório é fundamental para o sucesso do tratamento e avaliação laringoscópica da cicatrização.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dor e Febre</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Febre é incomum após microcirurgia de laringe.</li>
            <li>Dor de garganta pode ocorrer pelo tubo de intubação da anestesia — é passageira. Se persistir ou piorar, avise o médico assistente.</li>
          </ul>
        </div>
      </div>
    ),
  },

  // ── 4. Cirurgias de Ouvido (Tubo de Ventilação / Timpanotomia / Timpanoplastia) ──
  {
    id: 'ouvido',
    title: 'Cirurgias de Ouvido (Tubo / Timpanotomia / Timpanoplastia)',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2 flex items-center gap-1">
            <Ear size={14} /> Dieta
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Dieta <strong>livre</strong>, exceto alimentos muito quentes.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Curativo</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>O curativo com <strong>algodão</strong> serve apenas para conter eventual saída de secreção. Se o ouvido estiver seco, deixe-o <strong>exposto ao ar limpo</strong> do ambiente ou ar-condicionado (não muito frio).</li>
            <li>Curativo externo com gaze e esparadrapo quando necessário: realize limpeza da região periauricular com álcool 70%.</li>
            <li>Aplique a <strong>medicação prescrita</strong> corretamente no horário indicado. Em caso de dúvida, entre em contato com a equipe.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2 text-red-600">⭐ Cuidados com Água — CRÍTICO</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>O primeiro banho deve ser tomado apenas no <strong>dia seguinte</strong> à cirurgia.</li>
            <li className="font-semibold text-red-600">
              É expressamente proibido molhar o ouvido operado. Água pode causar infecção grave ou destruir o enxerto timpânico.
            </li>
            <li>
              Durante o banho: coloque um <strong>chumaço de algodão embebido em óleo</strong> (óleo de amêndoas ou Johnson&apos;s Baby) para vedar a entrada do ouvido.
            </li>
            <li>Lave a cabeça, a face e o cabelo com cuidado para <strong>não encharcar a orelha operada</strong>.</li>
            <li>Após o banho, limpe a região com algodão úmido e seque suavemente.</li>
            <li>Após <strong>30 minutos</strong> do término do banho, retire o algodão oleoso e deixe o ouvido <strong>ventilar</strong>.</li>
          </ul>
        </div>
      </div>
    ),
  },

  // ── 5. Tireoidectomia / Cervical ──────────────────────────────────────────
  {
    id: 'tireoide',
    title: 'Tireoidectomia / Cirurgia Cervical',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Dieta livre, mas evite mastigação excessiva nos primeiros 2 dias para não tracionar as incisões cervicais.</li>
            <li>Proibida <strong>atividade física de força por 30 a 45 dias</strong>.</li>
            <li>Evite movimentos bruscos de rotação do pescoço na primeira semana.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Curativo e Cicatriz</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Mantenha o curativo conforme orientado na alta. Limpeza com soro fisiológico e troca com periodicidade indicada.</li>
            <li>Após a retirada dos pontos, pode ser recomendado protetor solar e gel de silicone para minimizar a cicatriz.</li>
          </ul>
        </div>

        <AlertBlock color="amber" title="Atenção — Hipocalcemia (Baixo Cálcio)">
          <p>
            Se houver <strong>formigamento no rosto, lábios, língua ou extremidades</strong> (mãos e pés) nas primeiras 72h:{' '}
            sinal de hipocalcemia por manipulação das paratireoides.
          </p>
          <p>
            → Use rigorosamente o <strong>cálcio prescrito</strong> pelo cirurgião.
            Se sintomas refratários ou intensos, dirija-se à emergência.
          </p>
        </AlertBlock>
      </div>
    ),
  },

  // ── 6. Traqueostomia Pediátrica ───────────────────────────────────────────
  {
    id: 'traqueo-ped',
    title: 'Traqueostomia Pediátrica',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados Diários na Alta</h3>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li><strong>Limpeza:</strong> use luvas limpas. Limpe as cânulas interna e externa <strong>4 vezes ao dia</strong> conforme treinamento recebido.</li>
            <li><strong>Banho:</strong> a criança só pode ser banhada com adulto controlando ativamente a via aérea — nunca deixe a traqueostomia submersa ou exposta a jatos d'água.</li>
            <li>Aspire regularmente as secreções com sonda que <strong>não ultrapasse o comprimento da cânula</strong> original.</li>
            <li>Mantenha a área da traqueostomia seca e limpa; troque as fixações conforme orientado.</li>
          </ul>
        </div>

        <AlertBlock color="red" title="Emergência — Decanulação Acidental">
          <p>Se a cânula sair acidentalmente do pescoço:</p>
          <p>1. <strong>Deite a criança</strong> e estique suavemente o pescoço sobre os ombros.</p>
          <p>2. Lubrifique uma <strong>cânula limpa de reserva</strong> e reinsira com cuidado, evitando falso trajeto.</p>
          <p>3. Em qualquer sinal de angústia respiratória (tiragem, cianose, agitação intensa) ou dificuldade de reinserção: <strong>vá imediatamente ao PS Pediátrico mais próximo.</strong></p>
          <p className="mt-1 font-semibold">Tenha sempre uma cânula reserva calibrada em casa.</p>
        </AlertBlock>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const PeriOp: React.FC = () => {
  const navigate = useNavigate();
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const toggleCard = (id: string) =>
    setOpenCardId(prev => (prev === id ? null : id));

  const renderSection = (
    label: string,
    protocols: { id: string; title: string; iconColor?: string; content: React.ReactNode }[],
    accentColor: string
  ) => (
    <div className="space-y-2 mb-6">
      <h2 className="text-[11px] font-black text-gray-400 tracking-widest uppercase px-1 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
        {label}
      </h2>
      {protocols.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleCard(p.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
          >
            <span className="font-semibold text-gray-800 text-sm leading-snug pr-2">{p.title}</span>
            <div className={`shrink-0 ${p.iconColor || 'text-[#1D9E75]'}`}>
              {openCardId === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>
          <AnimatePresence>
            {openCardId === p.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-100"
              >
                <div className="p-4 bg-gray-50/60">{p.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="text-center space-y-1 mt-3 mb-5">
        <div className="w-14 h-14 bg-[#FBEBF3] text-[#D84989] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Activity size={28} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Protocolos Cirúrgicos</h1>
        <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
          Instruções de preparo pré-operatório e cuidados de recuperação pós-operatória.
        </p>
      </div>

      {renderSection('Módulo 1 — Pré-Operatório', PRE_PROTOCOLS, '#2b7a78')}
      {renderSection('Módulo 2 — Pós-Operatório', POST_PROTOCOLS, '#1D9E75')}

      <div className="pt-2">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-11 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm text-sm"
        >
          ← Voltar para Início
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-4 font-medium px-4 leading-relaxed">
        Conteúdo clínico baseado em protocolos do serviço. Dados pessoais removidos.{' '}
        Em dúvidas pré-operatórias ou emergências, contate a equipe cirúrgica imediatamente.
      </p>
    </div>
  );
};
