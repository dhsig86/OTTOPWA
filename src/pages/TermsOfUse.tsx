import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, BookOpen, AlertTriangle, Scale, HeartPulse, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import packageJson from '../../package.json';

export const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6 mt-2"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Termos de Uso</h1>
            <p className="text-xs text-gray-400">Última atualização: maio de 2026</p>
          </div>
        </div>

        {/* Disclaimer Clínico Principal */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <h2 className="text-sm font-bold text-amber-800">Aviso Clínico Importante</h2>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            O OTTO Ecosystem é uma <strong>ferramenta de apoio à decisão clínica e educação médica continuada</strong>, desenvolvida para auxiliar profissionais de saúde na organização, registro e análise de informações clínicas em Otorrinolaringologia.
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            As sugestões, cálculos, escores e conteúdos disponibilizados pela plataforma têm <strong>caráter exclusivamente orientativo e educacional</strong>. Nenhuma funcionalidade do OTTO substitui a avaliação clínica presencial, o raciocínio diagnóstico individualizado ou o julgamento profissional do médico responsável pelo paciente.
          </p>
          <p className="text-sm text-amber-900 leading-relaxed font-medium">
            Os resultados gerados pela plataforma não devem ser utilizados como critério diagnóstico definitivo, prescrição terapêutica autônoma ou fundamento único para condutas médicas.
          </p>
        </div>

        {/* Seções dos Termos */}
        <div className="space-y-4">

          {/* 1. Natureza da Plataforma */}
          <Section
            icon={<HeartPulse size={16} className="text-[#1D9E75]" />}
            title="1. Natureza e Finalidade"
          >
            <p>O OTTO Ecosystem é um conjunto integrado de ferramentas digitais voltadas à prática clínica e acadêmica em Otorrinolaringologia. A plataforma reúne módulos de codificação, cálculo de escores validados, registro cirúrgico, transcrição por inteligência artificial, apoio à triagem e educação médica.</p>
            <p>As informações clínicas processadas pela plataforma — incluindo sugestões diagnósticas, classificações de risco e interpretações de escores — são oferecidas como <strong>subsídio complementar</strong>, jamais como parecer médico vinculante.</p>
          </Section>

          {/* 2. Responsabilidade Clínica */}
          <Section
            icon={<BookOpen size={16} className="text-[#1D9E75]" />}
            title="2. Responsabilidade Clínica"
          >
            <p>A responsabilidade pela conduta clínica, diagnóstico e tratamento permanece <strong>integralmente com o profissional de saúde</strong> que atende o paciente. O OTTO não emite laudos médicos oficiais, não substitui exames complementares e não se destina à prática de telemedicina autônoma.</p>
            <p>Os módulos que utilizam inteligência artificial (incluindo triagem, transcrição, relatos de caso e sugestões diagnósticas) podem apresentar imprecisões inerentes ao estado da arte da tecnologia. O médico deve sempre confrontar as sugestões com seu conhecimento clínico e com as particularidades de cada caso.</p>
          </Section>

          {/* 3. Escores e Calculadoras */}
          <Section
            icon={<Scale size={16} className="text-[#1D9E75]" />}
            title="3. Escores e Calculadoras Clínicas"
          >
            <p>Os escores e calculadoras disponíveis no OTTO foram implementados com base em referências científicas publicadas e validadas pela comunidade otorrinolaringológica. No entanto, a aplicação de qualquer escore depende do contexto clínico, da seleção adequada dos parâmetros e da interpretação médica qualificada.</p>
            <p>A plataforma não se responsabiliza por erros de entrada de dados, interpretações fora do escopo original dos instrumentos ou aplicações em populações não contempladas pelas validações originais.</p>
          </Section>

          {/* 4. Privacidade e Proteção de Dados */}
          <Section
            icon={<ShieldCheck size={16} className="text-[#1D9E75]" />}
            title="4. Privacidade e Proteção de Dados"
          >
            <p>O OTTO Ecosystem está comprometido com a proteção de dados pessoais e segue os princípios da <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e as diretrizes do <strong>Conselho Federal de Medicina (CFM)</strong>.</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>A autenticação é realizada exclusivamente via <strong>Firebase Auth</strong> (Google SSO ou e-mail verificado).</li>
              <li>Dados clínicos de triagem são sanitizados antes da exposição pública, com campos de identificação pessoal (nome, CPF, telefone) explicitamente omitidos.</li>
              <li>Você pode <strong>exportar</strong> todos os seus dados a qualquer momento na seção de perfil.</li>
              <li>Você pode <strong>excluir sua conta</strong> e todos os dados associados permanentemente.</li>
              <li>Nenhum dado de paciente é compartilhado com terceiros sem consentimento explícito.</li>
            </ul>
          </Section>

          {/* 5. Uso Aceitável */}
          <Section
            icon={<Globe size={16} className="text-[#1D9E75]" />}
            title="5. Uso Aceitável"
          >
            <p>O uso da plataforma destina-se exclusivamente a fins lícitos, profissionais e educacionais. O usuário compromete-se a:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Não utilizar a plataforma para obter diagnósticos sem acompanhamento médico presencial.</li>
              <li>Não compartilhar credenciais de acesso com terceiros.</li>
              <li>Não inserir dados falsos ou manipular escores com intenção de distorcer resultados clínicos.</li>
              <li>Respeitar os direitos de propriedade intelectual do conteúdo, algoritmos e interfaces da plataforma.</li>
            </ul>
          </Section>

          {/* 6. Limitação de Responsabilidade */}
          <Section
            icon={<AlertTriangle size={16} className="text-gray-400" />}
            title="6. Limitação de Responsabilidade"
          >
            <p>O OTTO Ecosystem é fornecido <strong>"como está"</strong> (<em>as is</em>), sem garantias de disponibilidade ininterrupta, ausência de erros ou adequação a finalidades específicas. O desenvolvedor não se responsabiliza por:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Decisões clínicas tomadas exclusivamente com base nas sugestões da plataforma.</li>
              <li>Indisponibilidade temporária de serviços hospedados em plataformas de terceiros (Render, Heroku, Vercel).</li>
              <li>Perda de dados decorrente de falhas em infraestruturas de terceiros.</li>
            </ul>
          </Section>
        </div>

        {/* Aceitação */}
        <div className="bg-[#E1F7EE] border border-[#1D9E75]/20 rounded-2xl p-5">
          <p className="text-sm text-[#065f46] leading-relaxed">
            Ao utilizar o OTTO Ecosystem, você declara ciência e concordância com os termos acima. O uso continuado da plataforma constitui aceitação tácita destes termos.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[10px] text-gray-300">
            OTTO Ecosystem v{packageJson.version} · Desenvolvido por Dr. Dário Hart Signorini
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            Contato: dr.dhsig@gmail.com
          </p>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Componente auxiliar de seção ─────────────────────────────────────────── */
const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
      {children}
    </div>
  </div>
);
