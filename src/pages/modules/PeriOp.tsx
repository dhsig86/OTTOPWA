import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRE_PROTOCOLS = [
  {
    id: 'jejum',
    title: 'Instruções Gerais e Jejum',
    iconColor: 'text-[#2b7a78]',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2 flex items-center gap-2"><Clock size={16}/> Jejum Absoluto</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>O jejum de sólidos (não pode mais comer nada) deve ser iniciado 8 horas antes do horário agendado para a cirurgia.</li>
            <li><strong className="text-red-600">O desrespeito ao tempo de jejum cancela a cirurgia por risco de morte.</strong></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Internação e Documentação</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>A internação deve ser realizada com 3 horas de antecedência do horário da cirurgia.</li>
            <li>É obrigatório trazer os exames solicitados no pré-operatório, especialmente os exames de imagem (tomografias e ressonâncias).</li>
            <li>O termo de consentimento cirúrgico deve ser lido, assinado e entregue no dia da internação.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Cuidados Locais</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para cirurgias nasais, é sugerida a retirada de barba e bigode previamente à cirurgia para facilitar a fixação de curativos.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'medicacoes',
    title: 'Medicações e Risco Anestésico',
    iconColor: 'text-[#2b7a78]',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Analgésicos Permitidos</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Não utilizar nenhum medicamento novo na semana da cirurgia sem autorização médica.</li>
            <li>Dipirona e Paracetamol são os únicos analgésicos liberados.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Anticoagulantes (Atenção Extrema):</strong> Medicações que alteram a coagulação (AAS/Aspirina, Ginkgo Biloba, Clopidogrel, Warfarina, etc.) devem ser suspensas com 7 a 10 dias de antecedência, conforme avaliação do risco cirúrgico.
          </p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 leading-tight space-y-1">
            <strong>Emagrecimento / Diabetes (Risco de Broncoaspiração - GLP1):</strong><br/>
            Medicações que retardam o esvaziamento gástrico (Ozempic, Mounjaro, Wegovy, Saxenda, Trulicity, Victroza) <strong>DEVEM</strong> ser suspensas:<br/>
            - <strong>Semanal:</strong> Suspender 7 dias antes.<br/>
            - <strong>Diária:</strong> Suspender no dia.
          </div>
        </div>
        <p className="text-xs text-gray-500 italic mt-2">As demais medicações de uso crônico (pressão, tireoide, etc.) devem seguir estritamente a orientação dada pelo cardiologista no Risco Cirúrgico.</p>
      </div>
    )
  }
];

const POST_PROTOCOLS = [
  {
    id: 'fess',
    title: 'Cirurgia Endoscópica Nasossinusal (FESS)',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2 flex items-center gap-2"><Info size={16}/> Preparo Específico (Pré-Op)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Em casos de polipose, pode ser prescrito antibiótico e corticoide por 5 a 7 dias antes do procedimento para diminuir o sangramento.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados Pós-Operatórios</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Lavagem Nasal:</strong> É o fator mais importante para o sucesso da cirurgia. Iniciar a partir do 2º dia, lavando as narinas a cada 2 horas com no mínimo 80mL de soro.</li>
            <li>Compressas frias na face ajudam a evitar sangramentos.</li>
            <li>Evitar esforços físicos intensos e exposição ao sol nas primeiras 48 a 72 horas.</li>
            <li><strong className="text-red-500">É expressamente proibido assoar o nariz.</strong></li>
          </ul>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mt-2 rounded-r flex items-start gap-2">
          <Info size={18} className="text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-900">
            <strong>Retornos:</strong> As limpezas em consultório são fundamentais para remover crostas e evitar sinéquias (aderências). Não falte às consultas semanais.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'ouvido',
    title: 'Cirurgias de Ouvido (Tubo / Timpano)',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Cuidados Iniciais</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>A dieta é livre, devendo-se apenas evitar alimentos muito quentes.</li>
            <li>O curativo com algodão serve apenas para conter secreções. Caso o ouvido esteja seco, deixe-o exposto para ventilar.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados com a Água (Banho)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>O primeiro banho deve ser tomado apenas no dia seguinte à cirurgia.</li>
            <li><strong className="text-red-600">É expressamente proibido molhar o ouvido operado.</strong></li>
            <li>Durante o banho, utilize um chumaço de algodão embebido em óleo (ex: amêndoas ou Johnson) para vedar a entrada.</li>
            <li>Lave o rosto e os cabelos com extremo cuidado.</li>
            <li>Após 30 minutos do banho, retire o algodão oleoso para o ouvido ventilar.</li>
          </ul>
        </div>
      </div>
    )
  },
  // Re-injetando os úteis do último bloco só para não perder o material rico prévio
  {
    id: 'adeno',
    title: 'Adenoamigdalectomia',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Alimentação branda (líquida/pastosa) e fria por 7 a 10 dias.</li>
            <li><strong className="text-red-600">Proibido:</strong> Alimentos quentes ou de difícil mastigação.</li>
            <li>Gelo, sorvete e líquidos gelados à vontade.</li>
            <li>Repouso absoluto nas primeiras 24h e domiciliar até o 7º dia.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Atenção:</strong> Comunicar a equipe imediatamente em caso de febre alta ou vômito de sangue vivo volumoso.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'laringe',
    title: 'Micro-cirurgia de Laringe',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Repouso Vocal</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Absoluto nos 7 primeiros dias:</strong> não falar nada, nem sussurrar.</li>
            <li>Evitar ambientes poluídos, ar-condicionado e pigarrear.</li>
            <li><strong className="text-red-600">Proibido fumar.</strong></li>
          </ul>
        </div>
      </div>
    )
  }
];

export const PeriOp: React.FC = () => {
  const navigate = useNavigate();
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setOpenCardId(prev => prev === id ? null : id);
  };

  const renderSection = (title: string, protocols: any[], mainColor: string) => (
    <div className="space-y-3 mb-8">
      <h2 className="text-xs font-black text-gray-400 tracking-widest uppercase px-1 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mainColor }}></span>
        {title}
      </h2>
      {protocols.map((protocol) => (
        <div key={protocol.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleCard(protocol.id)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="font-bold text-gray-800 text-left">{protocol.title}</span>
            <div className={`shrink-0 ml-2 ${protocol.iconColor || 'text-[#1D9E75]'}`}>
              {openCardId === protocol.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          <AnimatePresence>
            {openCardId === protocol.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-100"
              >
                <div className="p-5 bg-gray-50/50">
                  {protocol.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center space-y-2 mt-4 mb-6">
        <div className="w-16 h-16 bg-[#FBEBF3] text-[#D84989] rounded-full flex flex-col items-center justify-center mx-auto mb-4 shadow-sm">
          <Activity size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Protocolos Cirúrgicos</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto px-4">
          Instruções de preparo pré-operatório e protocolos de recuperação.
        </p>
      </div>

      {renderSection('Módulo 1: Pré-Operatório', PRE_PROTOCOLS, '#2b7a78')}
      {renderSection('Módulo 2: Pós-Operatório', POST_PROTOCOLS, '#1D9E75')}

      <div className="pt-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          Voltar para Início
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 font-medium px-4">
        Em caso de dúvidas pré-operatórias ou emergências no pós-operatório, contate a equipe imediatamente.
      </p>
    </div>
  );
};
