import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROTOCOLS = [
  {
    id: 'adeno',
    title: 'Adenoamigdalectomia',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Alimentação branda (líquida/pastosa) e fria por 7 a 10 dias.</li>
            <li>Após o 7º dia, aumentar a consistência e temperatura progressivamente.</li>
            <li><strong className="text-red-600">Proibido:</strong> Alimentos quentes ou de difícil mastigação (biscoito, pipoca, batata frita) até liberação médica.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Alimentos Recomendados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Caldos e sopas no liquidificador; purês, sucos e vitaminas.</li>
            <li>Frutas cozidas/amassadas, leite, iogurte, gelatina, sorvetes e água de coco.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Repouso absoluto nas primeiras 24h (solicitar ajuda para levantar).</li>
            <li>Repouso domiciliar do 2º ao 7º dia.</li>
            <li>Esforço físico proibido nos primeiros 15-30 dias.</li>
            <li>Não se expor ao sol e evitar abaixar a cabeça.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dor de garganta/ouvido/cabeça; placas brancas na garganta.</li>
            <li>Pequenos sangramentos por boca/nariz e vômitos escuros (borra de café).</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Atenção:</strong> Comunicar a equipe imediatamente em caso de febre alta e persistente ou sangramento em grande quantidade.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'nasal',
    title: 'Cirurgia Nasal Funcional',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dieta livre, exceto alimentos muito quentes. (Se combinada com garganta, seguir dieta pastosa/fria).</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Primeiras 24h: repouso no leito.</li>
            <li>2º ao 14º dia: repouso relativo em casa, sem esforço físico.</li>
            <li>Não assoar o nariz ou fungar com força.</li>
            <li>Espirrar e tossir com a boca aberta.</li>
            <li>Não manipular o nariz. Limpeza de crostas apenas com lavagem de soro fisiológico frio/gelado.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pequena saída de sangue escurecido ou secreção rósea.</li>
            <li>Obstrução nasal, tonturas, lacrimejamento e dor/pressão leve nos ouvidos.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Atenção:</strong> Acionar a equipe em caso de sangramento excessivo, febre alta ou mal-estar súbito.
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
            <li>Nas semanas seguintes, diminuir ao máximo o uso da voz.</li>
            <li>Não cantar, gritar, pigarrear ou rir muito.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Hábitos</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Evitar alimentos muito quentes, ácidos e condimentados.</li>
            <li>Evitar bebidas gaseificadas, café, leite, chá preto e álcool.</li>
            <li><strong className="text-red-600">Proibido fumar.</strong> Beba bastante líquido em temperatura ambiente.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados Gerais</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dormir com travesseiro elevado e evitar esforço físico nas primeiras 48h.</li>
            <li>Evitar ambientes poluídos, ruidosos ou com ar condicionado forte.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Sintomas Esperados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Rouquidão normal por 15 a 30 dias (ou permanente, dependendo do caso).</li>
            <li>Leve dor de garganta devido à intubação.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'laringectomia',
    title: 'Laringectomia',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Medicações</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Com sonda:</strong> Seguir orientações de volume e limpeza da Nutrição. Medicações orais devem ser maceradas, diluídas em água e administradas pela sonda.</li>
            <li><strong>Sem sonda:</strong> Dieta pastosa em pouco volume, progredindo conforme liberação médica.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados com Traqueostomia</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Não permitir entrada de água durante o banho.</li>
            <li>Trocar e limpar a subcânula 4 vezes ao dia (com água, sabão neutro e escovinha; após lavar, ferver).</li>
            <li>Manter uma gaze dobrada de cada lado da cânula para proteger a pele.</li>
            <li>Nebulização com 5ml de soro fisiológico 0,9% para hidratação, se indicado.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Ferida Operatória</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Limpar com gaze e álcool 70% uma vez ao dia (longe do traqueostoma).</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Emergência:</strong> Em caso de falta de ar severa, remover a cânula inteira (cortando o cadarço) e ir imediatamente ao hospital.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'tireoide',
    title: 'Tireoidectomia / Paratireoidectomia',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Dieta e Repouso</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dieta livre (ou conforme doença de base pré-existente).</li>
            <li>Proibida atividade física de esforço moderado/grave no primeiro mês.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados com a Ferida</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Limpeza com gaze e álcool 70% uma vez ao dia.</li>
            <li>Pode ser lavada com água e sabão neutro durante o banho, secando suavemente com toalha limpa. Não requer oclusão, salvo indicação.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Atenção Especial (Cálcio)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Se apresentar cãibras ou formigamentos (sinal de cálcio baixo), utilizar o Carbonato de Cálcio prescrito conforme orientação. Se persistir, procurar a emergência.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'pequenas',
    title: 'Pequenas Lesões (Boca e Face)',
    content: (
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Lesões Orais (Lábio/Língua)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dieta:</strong> Líquida fria nas primeiras 48h; pastosa do 2º ao 7º dia; normal a partir do 8º dia.</li>
            <li><strong>Sintomas:</strong> Dor na língua ou local da biópsia é esperado. Repouso físico nas primeiras 48h.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Lesões Cervicais/Pele</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dieta:</strong> Preferência por alimentos macios nos primeiros 2 dias para não forçar a mastigação.</li>
            <li><strong>Curativo:</strong> Limpeza dos pontos com álcool 70% uma vez ao dia. Pode lavar com água e sabão de glicerina no banho.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            <strong>Atenção:</strong> Retornar em caso de febre, inchaço excessivo, vermelhidão ou saída de secreção com odor forte da ferida.
          </p>
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
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Cuidados Diários</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Limpeza:</strong> Usar luvas limpas. Limpar cânulas internas (se houver) 4x ao dia com água e sabão neutro. Proibido hipoclorito em cânulas metálicas.</li>
            <li><strong>Aspiração:</strong> Usar sondas descartáveis estéreis (espessura não deve passar 2/3 da cânula).</li>
            <li><strong>Fixação:</strong> Trocar cadarço sempre que sujo. Amarrar com 2 a 3 nós. O ajuste correto permite passar apenas 1 dedo entre o cadarço e a pele.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[#1D9E75] border-b pb-1 mb-2">Rotina (Banho e Dieta)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Banho com adulto, protegendo estritamente a cânula de água/sabão.</li>
            <li>Alimentação sentada. Se vomitar pela traqueostomia, aspirar imediatamente.</li>
            <li>Atenção para a criança não inserir alimentos no orifício.</li>
          </ul>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2 rounded-r flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 leading-tight">
            <strong>Emergência (Decanulação Acidental):</strong><br/>
            1. Deitar a criança com um coxim (apoio) sob os ombros.<br/>
            2. Levantar o queixo e afastar a pele.<br/>
            3. Lubrificar a cânula (xilocaína gel ou saliva) e reintroduzir.<br/>
            4. Se não entrar, tentar 1 número menor ou seguir direto à emergência.
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

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center space-y-2 mt-4 mb-6">
        <div className="w-16 h-16 bg-[#FBEBF3] text-[#D84989] rounded-full flex flex-col items-center justify-center mx-auto mb-4 shadow-sm">
          <Activity size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Orientações Pós-Operatórias</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto px-4">
          Protocolos consolidados de recuperação para Cirurgia de Cabeça e Pescoço e Otorrinolaringologia.
        </p>
      </div>

      <div className="space-y-3">
        {PROTOCOLS.map((protocol) => (
          <div key={protocol.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleCard(protocol.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-gray-800 text-left">{protocol.title}</span>
              <div className="text-[#1D9E75] shrink-0 ml-2">
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

      <div className="pt-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          Voltar para Início
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 font-medium">
        Acompanhamento médico contínuo é fundamental. Faltar aos retornos agendados acarreta em riscos pós-operatórios.
      </p>
    </div>
  );
};
