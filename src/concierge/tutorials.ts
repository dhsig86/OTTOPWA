export interface OttoTutorial {
  id: string;
  title: string;
  emoji: string;
  audience: string;
  summary: string;
  steps: string[];
  tip: string;
  shortcutCommand: string;
}

export const OTTO_TUTORIALS: OttoTutorial[] = [
  {
    id: 'protto',
    title: 'PROTTO — Prontuário ORL Inteligente',
    emoji: '📝',
    audience: 'Médicos Otorrinolaringologistas',
    summary: 'Centralize atendimentos com geração de anamnese estruturada a partir de triagens ou ditados de voz, utilizando IA de alta performance.',
    steps: [
      'Acesse o módulo PROTTO através do painel principal ou via comando de chat ("abrir protto").',
      'Selecione uma triagem de paciente pendente ou inicie um atendimento livre.',
      'Utilize o assistente cognitivo integrado para gerar diagnósticos diferenciais fundamentados e prescrições sugeridas.',
      'Revise o prontuário estruturado e salve no Firestore para manter a evolução clínica do paciente.'
    ],
    tip: 'Integre o PROTTO com o OTTO Whisper para ditar a consulta em tempo real e ver a anamnese se estruturar sozinha.',
    shortcutCommand: 'abrir protto'
  },
  {
    id: 'procod',
    title: 'CID & TUSS — Codificação e Faturamento',
    emoji: '🏷️',
    audience: 'Médicos e Faturamento Clínico',
    summary: 'Encontre rapidamente a correspondência exata entre procedimentos cirúrgicos TUSS (CBHPM) e patologias CID-10 da otorrinolaringologia.',
    steps: [
      'Abra o CID & TUSS na aba de ferramentas clínicas ou pelo comando ("tuss septoplastia").',
      'Digite palavras-chave do procedimento ou da doença na barra de busca rápida.',
      'Marque os códigos cirúrgicos adicionais e OPME associados necessários para o procedimento.',
      'Copie o bloco de faturamento consolidado com 1 clique para colar no seu prontuário ou sistema do convênio.'
    ],
    tip: 'O Concierge pode buscar códigos diretamente! Digite por exemplo: "tuss amigdalectomia" e o plano de faturamento será resumido.',
    shortcutCommand: 'tuss septoplastia'
  },
  {
    id: 'whisper',
    title: 'OTTO Whisper — Escriba e Ditado Médico',
    emoji: '🎙️',
    audience: 'Médicos e Fonoaudiólogos',
    summary: 'Grave conversas ou ditados clínicos e obtenha transcrições higienizadas com resumo estruturado por IA de forma instantânea.',
    steps: [
      'Acesse o OTTO Whisper e certifique-se de que o acesso ao microfone do seu dispositivo está autorizado.',
      'Clique em "Iniciar Gravação" ao iniciar a conversa com o paciente ou no final do atendimento para ditar as conclusões.',
      'Fale naturalmente. A IA filtra ruídos, hesitações e termos coloquiais.',
      'Ao finalizar, clique em "Parar e Transcrever" e copie a anamnese limpa e pronta.'
    ],
    tip: 'Conformidade LGPD: evite gravar dados de identificação explícita do paciente (nomes completos, RG, CPF) durante a gravação de áudio.',
    shortcutCommand: 'abrir whisper'
  },
  {
    id: 'calc',
    title: 'CALC-HUB — Calculadoras Clínicas ORL',
    emoji: '🧮',
    audience: 'Otorrinos, Residentes e Fonoaudiólogos',
    summary: 'Acesse os principais questionários e escores validados internacionalmente (SNOT-22, Epworth, STOP-Bang, VHI, DHI, THI) com cálculo automático.',
    steps: [
      'Selecione a calculadora desejada na lista lateral do Concierge ou na aba pública.',
      'Preencha as respostas fornecidas pelo paciente durante o exame ou anamnese.',
      'Confira a pontuação final calculada em tempo real, acompanhada da escala de gravidade da patologia.',
      'Clique em "Copiar Texto" para exportar o laudo resumido do escore para a evolução do prontuário.'
    ],
    tip: 'Aplique o questionário SNOT-22 pré-operatório e 3 meses pós-operatório para mensurar de forma objetiva a eficácia da cirurgia nasal.',
    shortcutCommand: 'abrir snot22'
  },
  {
    id: 'info',
    title: 'OTTO Update — Pílulas de Literatura Científica',
    emoji: '📚',
    audience: 'Médicos, Residentes e Estudantes de Medicina',
    summary: 'Atualize-se em poucos minutos com consensos e condutas práticas baseadas nas publicações científicas mais influentes de ORL.',
    steps: [
      'Abra o OTTO Update no menu de Academia ou solicite ao assistente ("abrir update").',
      'Selecione a pílula do dia na especialidade desejada (Rinologia, Otologia, Laringologia, etc.).',
      'Navegue pelas abas: Duelo de Evidências (ciência), Pílula Prática (conduta) e Quiz de Fixação.',
      'Marque como lido para progredir no ranking clínico e favorite as pílulas para consulta rápida.'
    ],
    tip: 'Aproveite o quiz de fixação ao final de cada pílula para fixar os principais takeaways e aplicá-los com segurança no consultório.',
    shortcutCommand: 'abrir update'
  },
  {
    id: 'otoscopia',
    title: 'Otoscop.IA — Inteligência Artificial em Otoscopia',
    emoji: '🔍',
    audience: 'Médicos, Pediatras e Clínicos Gerais',
    summary: 'Suporte à decisão clínica assistido por visão computacional para rastreamento de lesões da membrana timpânica e conduto auditivo.',
    steps: [
      'Acesse o Otoscop.IA através da página inicial ou solicitando ao assistente ("abrir otoscopia").',
      'Faça o upload ou tire uma foto nítida e enquadrada da membrana timpânica do paciente.',
      'Aguarde a análise da rede neural profunda, que apontará as probabilidades diagnósticas (Ex: OMA, Perfuração, Normal).',
      'Compare a sugestão da IA com a laringoscopia/otoscopia clínica e tome a decisão terapêutica final.'
    ],
    tip: 'Para obter alta precisão da rede neural, limpe a lente do otoscópio digital e minimize reflexos de luz direta na imagem capturada.',
    shortcutCommand: 'abrir otoscopia'
  },
  {
    id: 'triagem',
    title: 'Triagem OS — Protocolo de Anamnese Digital',
    emoji: '📋',
    audience: 'Secretárias, Clínicas e Pacientes',
    summary: 'Colete sintomas e queixas do paciente de forma interativa por WhatsApp ou tablet antes mesmo do atendimento médico começar.',
    steps: [
      'Disponibilize o link de triagem no WhatsApp da clínica ou em um tablet na sala de espera.',
      'O paciente responde às perguntas guiadas pela IA clínica sobre os seus sintomas.',
      'A IA compila uma anamnese narrativa estruturada em linguagem profissional.',
      'O médico abre o prontuário (PROTTO) e importa os dados da triagem com 1 clique, poupando tempo de digitação.'
    ],
    tip: 'A triagem reduz o tempo médio de primeira consulta em até 40%, permitindo que o médico foque no exame físico e no acolhimento.',
    shortcutCommand: 'abrir triagem'
  },
  {
    id: 'autolaudo',
    title: 'AUTOLAUDO — Editor por Voz e IA',
    emoji: '✍️',
    audience: 'Médicos Otorrinolaringologistas',
    summary: 'Gere laudos de exames endoscópicos (videolaringoscopia, nasofibroscopia) com autocompletar inteligente e comandos de voz rápidos.',
    steps: [
      'Selecione o modelo de exame desejado (Nasal, Laríngeo ou Otológico).',
      'Utilize o ditado de voz para descrever os achados clínicos observados no monitor de vídeo.',
      'A IA do AUTOLAUDO corrige termos e estrutura o texto sob as normas de laudos padrões da especialidade.',
      'Visualize a visualização final timbrada e exporte para PDF.'
    ],
    tip: 'Crie atalhos de voz customizados para laudos normais para preencher o exame inteiro com apenas 1 palavra.',
    shortcutCommand: 'abrir autolaudo'
  },
  {
    id: 'aerodig',
    title: 'Aerodigestive — Medicina Aerodigestiva Pediátrica',
    emoji: '🌬️',
    audience: 'Otorrinolaringologistas Pediátricos e Pediatras',
    summary: 'Consulte diretrizes, escalas de estenose subglótica (Monnier, Myer-Rutter), protocolos de decanulação e manejo de traqueostomias infantis.',
    steps: [
      'Abra o módulo Aerodigestive a partir do painel ou enviando "abrir aerodig".',
      'Navegue entre as seções de Condutas de Via Aérea, Disfagia Pediátrica e Calculadoras de Cânula.',
      'Acesse as ferramentas interativas de dimensionamento de cânulas (Shiley, Bivona) conforme peso e idade do paciente.',
      'Utilize os fluxogramas de tomada de decisão clínica para manejo de fenda laríngea e laringomalácia.'
    ],
    tip: 'Utilize a calculadora de cânulas do módulo ao discutir casos de estenose e planejamento cirúrgico pediátrico.',
    shortcutCommand: 'abrir aerodig'
  },
  {
    id: 'logbook',
    title: 'OTTO Log — Livro de Registro Cirúrgico',
    emoji: '📋',
    audience: 'Cirurgiões e Residentes de ORL',
    summary: 'Registre suas cirurgias e obtenha gráficos automáticos de casuística, estatísticas de complicações e relatórios exportáveis para o MEC/ABORL.',
    steps: [
      'Acesse o OTTO Log pelo menu ou comando ("abrir logbook").',
      'Clique em "Adicionar Nova Cirurgia" e preencha a data, hospital, procedimento (TUSS) e desfecho.',
      'Adicione registros de fotos intraoperatórias ou anotações de técnicas cirúrgicas específicas de forma segura.',
      'Acompanhe o dashboard estatístico em tempo real com distribuição de cirurgias por subespecialidade e via de acesso.'
    ],
    tip: 'Mantenha o OTTO Log atualizado semanalmente. Ele serve como seu portfólio cirúrgico consolidado para fins acadêmicos e comprovação.',
    shortcutCommand: 'abrir logbook'
  },
  {
    id: 'ocr',
    title: 'OTTO OCR — Extrator de Laudos e Carteirinhas',
    emoji: '📄',
    audience: 'Médicos e Recepcionistas',
    summary: 'Faça upload de laudos de exames anteriores em PDF ou fotos de carteirinhas de convênio para extrair os dados e textos estruturados instantaneamente.',
    steps: [
      'Abra o OTTO OCR no menu ou enviando "abrir ocr".',
      'Arraste o arquivo PDF do exame ou a imagem da carteirinha para a área de upload.',
      'A IA processa o documento clínico e transcreve os campos fundamentais estruturando as informações.',
      'Copie o texto reconhecido ou os dados estruturados do convênio para o cadastro do PWA com um clique.'
    ],
    tip: 'O processamento do OCR é ideal para converter laudos antigos de audiometria digitalizados em texto puro para colar no PROTTO.',
    shortcutCommand: 'abrir ocr'
  },
  {
    id: 'imune',
    title: 'Imunobiológicos — Elegibilidade e Formulários LME',
    emoji: '💉',
    audience: 'Médicos Otorrinolaringologistas',
    summary: 'Avalie a elegibilidade de pacientes com Polipose Nasossinusal Grave para tratamento com anticorpos monoclonais (Dupilumabe, Mepolizumabe) e gere a documentação LME.',
    steps: [
      'Abra o portal de Imunobiológicos a partir do menu ou com o comando ("abrir imune").',
      'Preencha os critérios clínicos do paciente (número de cirurgias prévias, uso de corticoides, escore SNOT-22 e presença de asma).',
      'Verifique se os critérios da ANVISA e diretrizes da Associação Médica estão preenchidos para cobertura pelo convênio.',
      'Gere e faça download do relatório de justificativa clínica e formulários LME preenchidos automaticamente.'
    ],
    tip: 'O preenchimento automático das LMEs economiza cerca de 20 minutos de burocracia por paciente elegível a imunobiológico.',
    shortcutCommand: 'abrir imune'
  },
  {
    id: 'ottotests',
    title: 'OTTO Acadêmico — Simulados e MCQ',
    emoji: '🎓',
    audience: 'Médicos Residentes e Estudantes',
    summary: 'Estude com um banco de centenas de questões de múltipla escolha focadas no Título de Especialista (TEGO/ABORL-CCF) com resoluções comentadas por IA.',
    steps: [
      'Acesse o OTTO Acadêmico clicando no módulo ou enviando "abrir academico".',
      'Selecione uma área de estudo (Otologia, Rinologia, Bucolaringologia, ORL Pediátrica) ou crie um simulado geral.',
      'Responda às questões cronometradas e veja a correção imediata.',
      'Consulte a explicação detalhada de cada alternativa e as referências dos tratados nacionais.'
    ],
    tip: 'Utilize o modo simulado com imagens para treinar o reconhecimento visual de otoscopias e exames de imagem comuns em provas.',
    shortcutCommand: 'abrir academico'
  }
];
