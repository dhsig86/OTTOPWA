import { useState } from 'react';
import { Activity, Radio, Headphones, Info } from 'lucide-react';
import { WarningModal } from '../../components/zumbido/WarningModal';
import { TinnitusSynthesizer } from '../../components/zumbido/TinnitusSynthesizer';
import { SoundTherapy } from '../../components/zumbido/SoundTherapy';
import './ZumbidoTherapy.css';

export const ZumbidoTherapy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'synth' | 'therapy'>('synth');
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Header Nativo PWA (Opcional, já temos o AppBar do PWA, mas mantemos o titulo da aba) */}
      <div className="px-4 py-4 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E1F7EE] rounded-xl flex items-center justify-center p-2">
            <Activity className="w-6 h-6 text-[#1D9E75]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-tight text-slate-800">OTTO Zumbido</h1>
            <p className="text-[#1D9E75] text-xs font-bold">Terapia Sonora & Sintetizador</p>
          </div>
        </div>
        <button onClick={() => setShowWarning(true)} className="p-2 text-slate-400 hover:text-[#1D9E75] transition-colors bg-slate-50 rounded-full" title="Informações de Segurança">
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 animate-in fade-in duration-500">
        {activeTab === 'synth' && <TinnitusSynthesizer />}
        {activeTab === 'therapy' && <SoundTherapy />}
      </main>

      {/* Bottom Navigation Específico do Módulo */}
      <nav className="fixed bottom-[60px] left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 pb-safe">
        <div className="max-w-lg mx-auto flex">
          <button 
            onClick={() => setActiveTab('synth')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'synth' ? 'text-[#1D9E75]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Radio className={`w-6 h-6 ${activeTab === 'synth' ? 'fill-[#E1F7EE]' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sintetizador</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('therapy')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'therapy' ? 'text-[#1D9E75]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Headphones className={`w-6 h-6 ${activeTab === 'therapy' ? 'fill-[#E1F7EE]' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Terapia Sonora</span>
          </button>
        </div>
      </nav>

      {showWarning && <WarningModal onClose={() => setShowWarning(false)} />}
    </div>
  );
};
