export interface ModuleCapabilityInfo {
  description: string;
  targetProfile: 'medico' | 'paciente' | 'ambos';
  mainFeatures: string[];
}

export const MODULE_CAPABILITIES_DB: Record<string, ModuleCapabilityInfo> = {
  calc: {
    description: 'Hub de calculadoras e escores clínicos ORL (SNOT-22, THI, DHI, TNM, STOP-Bang).',
    targetProfile: 'ambos',
    mainFeatures: ['Cálculo de escores', 'Orientação diagnóstica paramétrica', 'Envio de resultados']
  },
  procod: {
    description: 'Gerador de laudos cirúrgicos ORL estruturados com codificação TUSS, CID-10 e OPME.',
    targetProfile: 'medico',
    mainFeatures: ['Busca inteligente CID/TUSS', 'Preenchimento de OPME', 'Exportação de relatórios cirúrgicos']
  },
  logbook: {
    description: 'Registro cirúrgico pessoal digital e casuística cirúrgica em ORL.',
    targetProfile: 'medico',
    mainFeatures: ['Salvar dados cirúrgicos', 'Sanitização EXIF automática de fotos', 'Estatísticas de cirurgias']
  },
  check: {
    description: 'Plataforma de triagem de sintomas de audição e zumbido.',
    targetProfile: 'paciente',
    mainFeatures: ['Triagem de acuidade auditiva', 'Inventário de queixa', 'Sound Therapy (ruídos terapêuticos)']
  },
  zumbido: {
    description: 'Módulo dedicado ao alívio e terapia sonora de tinnitus/zumbido.',
    targetProfile: 'paciente',
    mainFeatures: ['Player de Terapia Sonora (ruído branco/rosa)', 'Mascaramento acústico', 'Acompanhamento diário']
  },
  periop: {
    description: 'Guia de orientações pré e pós-operatórias para procedimentos cirúrgicos ORL.',
    targetProfile: 'paciente',
    mainFeatures: ['Calculadora de jejum cirúrgico', 'Instruções de pós-operatório', 'Sinais de alerta']
  },
  voice: {
    description: 'Módulo de voz e fonoaudiologia para avaliação e treinamento vocal.',
    targetProfile: 'ambos',
    mainFeatures: ['Espectrograma de voz', 'Treinamento de frequência fundamental', 'Exercícios de aquecimento vocal']
  },
  games: {
    description: 'Jogos educativos ORL interativos voltados ao aprendizado de saúde.',
    targetProfile: 'paciente',
    mainFeatures: ['Quiz interativo', 'Gamificação do aprendizado ORL']
  },
  ocr: {
    description: 'Extrator inteligente de texto de exames e guias clínicas via OCR.',
    targetProfile: 'medico',
    mainFeatures: ['Leitura de PDFs e imagens', 'Estruturação de dados extraídos']
  },
  bottok: {
    description: 'Chatbot inteligente RAG para busca de consensos e artigos ORL.',
    targetProfile: 'ambos',
    mainFeatures: ['Busca de evidências científicas', 'Respostas estruturadas sobre diretrizes clínicas']
  },
  whisper: {
    description: 'Escriba médico inteligente para gravação e evolução automatizada de consultas.',
    targetProfile: 'medico',
    mainFeatures: ['Gravação de áudio em tempo real', 'Transcrição clínica especializada', 'Geração de evolução de prontuário']
  },
  autolaudo: {
    description: 'Editor inteligente de laudos médicos com autocompletar baseado em inteligência artificial.',
    targetProfile: 'medico',
    mainFeatures: ['Modelos de laudos estruturados', 'Sugestões inteligentes baseadas em exames anteriores']
  },
  cases: {
    description: 'Assistente para criação e redação de relatos de casos clínicos científicos ORL.',
    targetProfile: 'medico',
    mainFeatures: ['Auxílio na redação científica', 'Intake inteligente de exames', 'Formatação conforme diretrizes acadêmicas']
  },
  protto: {
    description: 'Prontuário eletrônico inteligente adaptado para otimizar o fluxo de atendimento ORL.',
    targetProfile: 'medico',
    mainFeatures: ['Evoluções baseadas em NLP', 'Mapeamento de queixas e condutas automáticas']
  },
  triagem: {
    description: 'Protocolo de triagem e admissão clínica ORL com IA conversacional. Gera prontuários pré-consulta estruturados.',
    targetProfile: 'ambos',
    mainFeatures: ['Triagem conversacional guiada por IA', 'Anamnese estruturada ORL', 'Geração de prontuário pré-consulta']
  },
  videos: {
    description: 'Curadoria de vídeos educativos ORL do YouTube, organizados por especialidade e nível.',
    targetProfile: 'ambos',
    mainFeatures: ['Vídeos de otoscopia e exame físico', 'Aulas de anatomia ORL', 'Conteúdo para pacientes e profissionais']
  },
  aerodig: {
    description: 'Hub clínico-editorial de medicina aerodigestiva pediátrica. Protocolos de via aérea e cânulas.',
    targetProfile: 'medico',
    mainFeatures: ['Guia de cânulas de traqueostomia', 'Protocolos de via aérea pediátrica', 'Calculadoras aerodigestivas']
  },
  imune: {
    description: 'Calculadora de elegibilidade para imunobiológicos em rinossinusite crônica e outras indicações ORL.',
    targetProfile: 'medico',
    mainFeatures: ['Checklist de elegibilidade Dupilumabe', 'Critérios PCDT/CONITEC', 'Documentação para solicitação']
  },
  ottotests: {
    description: 'Banco de questões de residência médica ORL com simulados cronometrados e exercícios discursivos.',
    targetProfile: 'medico',
    mainFeatures: ['Simulados de provas (FUNDATEC, IBFC, VUNESP)', 'Questões com imagens clínicas', 'Exercícios discursivos com correção IA']
  },
  atlas: {
    description: 'Atlas digital de otoscopia com acervo público de imagens clínicas classificadas e quiz interativo.',
    targetProfile: 'ambos',
    mainFeatures: ['Galeria de imagens otoscópicas por diagnóstico', 'Quiz clínico e anatômico', 'Hub de curadoria colaborativa']
  },
  otoscopia: {
    description: 'OTOSCOP-IA: classificador de imagens otoscópicas por inteligência artificial (9 categorias diagnósticas).',
    targetProfile: 'medico',
    mainFeatures: ['Upload de foto do tímpano', 'Classificação automática por IA (ResNet)', 'Feedback para retreinamento do modelo']
  },
  info: {
    description: 'OTTO NEWS: pílulas científicas diárias baseadas em artigos reais do PubMed, resumidas por IA.',
    targetProfile: 'medico',
    mainFeatures: ['Pílulas científicas com evidência PubMed', 'Quiz de fixação por pílula', 'Gráficos de insight e favoritos']
  },
  feedback: {
    description: 'Canal de feedback, sugestões e relato de bugs para o ecossistema OTTO.',
    targetProfile: 'ambos',
    mainFeatures: ['Envio de sugestões e bug reports', 'Classificação por módulo', 'Acompanhamento de status']
  },
  fono: {
    description: 'OTTO FONO: módulo de reabilitação fonoaudiológica e vestibular domiciliar para voz, disfagia, apneia e tontura.',
    targetProfile: 'ambos',
    mainFeatures: ['Exercícios de trato vocal (Lax Vox) interativos', 'Protocolo miofuncional de orofaringe para apneia', 'Manobras de deglutição com triagem e segurança ativa', 'Reabilitação vestibular com metrônomos visuais e Brandt-Daroff']
  }
};
