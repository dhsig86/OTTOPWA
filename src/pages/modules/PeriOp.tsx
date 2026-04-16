import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRE_PROTOCOLS = [
  {
    id: 'gerais',
    title: 'Orientações Gerais Pré-Operatórias',
    iconColor: 'text-[#2b7a78]',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Agendamento e Liberação</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>A confirmação do agendamento cirúrgico só é realizada após a entrega da senha de liberação do plano de saúde à secretaria.</li>
            <li>Traga os exames solicitados, especialmente os de imagem (tomografias, ressonâncias).</li>
            <li>O <strong>Termo de Consentimento</strong> cirúrgico é obrigação legal e deve ser assinado e entregue no dia.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2 flex items-center gap-2"><Clock size={16}/> Jejum e Internação</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>O jejum para sólidos deve ser iniciado <strong>8 horas antes</strong> do horário da cirurgia.</li>
            <li>A internação deve ser realizada com <strong>2 a 3 horas de antecedência</strong>.</li>
            <li>O tempo médio de internação é de 24 horas.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Cuidados Locais</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para cirurgias nasais: recomenda-se a retirada de bigode e barba previamente ao procedimento.</li>
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
          <h3 className="font-bold text-[#2b7a78] border-b pb-1 mb-2">Regras Gerais</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Não utilize</strong> medicamento novo na semana da cirurgia sem liberação médica.</li>
            <li>Analgésicos liberados: <strong>Dipirona</strong> e <strong>Paracetamol</strong>.</li>
            <li>Mantenha as medicações crônicas conforme Risco Cirúrgico.</li>
            <li>Informe todas as alergias ao anestesista.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800 leading-tight space-y-1">
            <strong>Anticoagulantes e Anti-inflamatórios (Atenção):</strong><br/>
            Devido ao risco de sangramento, suspender <strong>7 dias antes</strong>: AAS/Aspirina, Clopidogrel, Warfarina, Ginkgo Biloba, Ibuprofeno, Naproxeno e Diclofenaco.
          </div>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 leading-tight space-y-1">
            <strong>ALERTA ANESTÉSICO — Análogos de GLP-1 (Ozempic, Mounjaro, Wegovy, Saxenda):</strong><br/>
            Essas medicações retardam o esvaziamento gástrico e aumentam agressivamente o risco de <strong>broncoaspiração</strong>.<br/>
            - <strong>Doses semanais:</strong> Suspender de 7 a 10 dias antes.<br/>
            - <strong>Doses diárias:</strong> Suspender no dia da cirurgia.
          </div>
        </div>
      </div>
    )
  }
];

const EPISTAXE_ALERT = (
  <div className="bg-red-50 border-l-4 border-red-600 p-3 mt-3 rounded-r flex flex-col gap-1">
    <div className="flex items-start gap-2 mb-1">
      <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
      <strong className="text-xs text-red-800 uppercase tracking-wide">Alerta Especial (Epistaxe/Hematemese)</strong>
    </div>
    <div className="text-[11px] text-red-900 leading-tight ml-6">
      <strong>Epistaxe</strong> (sangramento ativo nasal grave) ou <strong>Hematemese</strong> (vômito de sangue vivo volumoso) são urgências.
      <br/>• Sente-se inclinado para frente. <strong>Não deite a cabeça para trás.</strong>
      <br/>• Avise a equipe cirúrgica na hora.
      <br/>• Se não ceder em 10-15 min, corra à emergência hospitalar mais próxima. Não tome remédios por conta própria.
    </div>
  </div>
);

const POST_PROTOCOLS = [
  {
    id: 'adeno',
    title: 'Adenoidectomia / Amigdalectomia / Uvulo.',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Alimentação</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Alimentação branda, líquida/pastosa e fria por <strong>7 a 10 dias</strong>.</li>
            <li>Após o 7º dia, a consistência deve aumentar progressivamente (líquido → pastoso → sólido).</li>
            <li><strong className="text-red-600">Proibido:</strong> Alimentos quentes (café/chá) e de difícil mastigação (biscoito, pipoca, batata frita, carne em pedaços).</li>
            <li><strong>Recomendado:</strong> Sopas/caldos de liquidificador, sucos, frutas amassadas, purês, gelatina, sorvetes e leite/iogurte.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Repouso e Esforço</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Primeiras 24h:</strong> Repouso absoluto (pedir ajuda para andar; tonturas são comuns).</li>
            <li><strong>2º ao 7º dia:</strong> Repouso domiciliar. Evite baixar a cabeça de forma brusca.</li>
            <li><strong>15 a 30 dias:</strong> Esforço físico e esportes <strong>proibidos</strong>.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dor de garganta, febre baixa, dor de ouvido (reflexo) e cefaleia.</li>
            <li><strong>Placas brancas na garganta:</strong> É cicatrização normal, NÃO as remova.</li>
            <li>Pequenos vômitos escuros na primeira noite (restos de sangue da cirurgia - "borra de café").</li>
          </ul>
        </div>
        {EPISTAXE_ALERT}
      </div>
    )
  },
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
            <li><strong>Lavagem Nasal:</strong> O fator de ouro do sucesso cirúrgico. Comece no 2º dia, a cada 2h (mínimo de 80mL/lavagem).</li>
            <li>Compressas frias na face ajudam a conter inchaço e sangramento leve esperado.</li>
            <li><strong className="text-red-500">Proibido assoar o nariz</strong> e evitar sol / esportes intensos nos primeiros 20 dias.</li>
          </ul>
        </div>
        {EPISTAXE_ALERT}
      </div>
    )
  },
  {
    id: 'laringe',
    title: 'Micro-cirurgia de Laringe / Fono',
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
            <li>O curativo com algodão serve apenas para conter secreções. Cesse quando secar ao longo da semana.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados com a Água (Banho)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>O primeiro banho deve ser tomado apenas no dia seguinte à cirurgia.</li>
            <li><strong className="text-red-600">É expressamente proibido molhar o ouvido operado. Pode surdar-se ou destruir o enxerto!</strong></li>
            <li>Durante o banho, utilize um chumaço de algodão embebido em óleo (ex: amêndoas ou Johnson) para vedar a entrada.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'tireoide',
    title: 'Tireoidectomia / Cérvico-Facial',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dieta livre, mas prefira não forçar muito a mandíbula nos primeiros 2 dias para não tracionar incisões cervicais.</li>
            <li>Proibida atividade física de força por 30 a 45 dias.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Atenção Especial (Cálcio)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Se houver formigamento no rosto, boca ou extremidades (Sinal de Hipocalcemia), usar rigorosamente o cálcio prescrito pelo cirurgião ou ir à emergência caso refratário.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'traqueo-ped',
    title: 'Traqueostomia Pediátrica',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados Diários na Alta</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Limpeza:</strong> Usar luvas limpas. Limpar cânulas 4x ao dia.</li>
            <li><strong>Vias de banho:</strong> Criança só pode receber banho apoiada com adulto estritamente travando a via aérea de mergulhar ou aspirar sabão!</li>
            <li>Aspirar regularmente toda secreção com sonda que não transponha o tamanho da traqueostomia original.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-600 p-3 mt-2 rounded-r">
          <p className="text-xs text-red-900 leading-tight">
            <strong>Acidentes (Decanulação Pediátrica):</strong><br/>
            Se a cânula sair do pescocinho: Deite a criança rapidamente, estique o pescoço sobre os ombros, lubrifique levemente outra cânula limpa e reinsira o mais rápido possível evitando falso trajeto. Corra em qualquer angústia respiratória ao PS Infantil.
          </p>
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
