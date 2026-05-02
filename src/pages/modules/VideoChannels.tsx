import React from 'react';
import { PlaySquare, ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const VideoChannels: React.FC = () => {
  const { profile } = useAuth();
  const isPro = profile === 'medico' || profile === 'estudante' || profile === 'profissional';

  return (
    <div className="p-4 pb-24 max-w-sm mx-auto space-y-4">

      {/* Header */}
      <div className="pt-2 pb-1">
        <h2 className="text-lg font-bold text-gray-800">Canais de Vídeo ORL</h2>
        <p className="text-xs text-gray-500 mt-1">Conteúdo curado por Dr. Dario Hart</p>
      </div>

      {/* ── Playlist do Paciente ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Embedded playlist */}
        <div className="w-full aspect-video bg-gray-100">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/videoseries?list=PL4f19b4zuy8flHTkM-I2C3m4hKnswvUPZ"
            title="OTTORRINDO E ILUSTRANDO"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <PlaySquare size={20} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 leading-tight">OTTORRINDO E ILUSTRANDO</div>
              <div className="text-xs text-gray-500 mt-0.5">Canal do Paciente · ORL Ilustrado</div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Vídeos explicativos sobre doenças do ouvido, nariz e garganta.
                Linguagem acessível para pacientes e familiares.
              </p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/playlist?list=PL4f19b4zuy8flHTkM-I2C3m4hKnswvUPZ"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 h-10 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl text-sm transition-all"
          >
            <ExternalLink size={14} />
            Abrir Playlist no YouTube
          </a>
        </div>
      </div>

      {/* ── Canal de Residentes / Profissionais (gate: médico | estudante | profissional) ── */}
      {isPro ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Embedded residents playlist */}
          <div className="w-full aspect-video bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/videoseries?list=PL4f19b4zuy8fGhD1nDOG3Lqt6b28t3dYa"
              title="ORL para Residentes"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E1F7EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                <PlaySquare size={20} className="text-[#1D9E75]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 leading-tight">ORL para Residentes</div>
                <div className="text-xs text-gray-500 mt-0.5">Canal Clínico · Formação Médica</div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Conteúdo clínico-cirúrgico em Otorrinolaringologia voltado para
                  residentes e profissionais de saúde em formação.
                </p>
              </div>
            </div>

            <a
              href="https://youtube.com/playlist?list=PL4f19b4zuy8fGhD1nDOG3Lqt6b28t3dYa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 h-10 bg-[#1D9E75] hover:bg-[#178a65] active:scale-95 text-white font-semibold rounded-xl text-sm transition-all"
            >
              <ExternalLink size={14} />
              Abrir Playlist no YouTube
            </a>
          </div>
        </div>
      ) : (
        /* Locked card for patients */
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Lock size={16} className="text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Canal Clínico ORL</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Disponível para médicos, residentes e profissionais de saúde.
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400 pb-2">
        Conteúdo educativo · Não substitui avaliação médica presencial
      </p>
    </div>
  );
};
