import React from 'react';
import { Volume2, Play, Square, Headphones, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useZumbidoAudioEngine } from '../../hooks/useZumbidoAudioEngine';
import { AudioVisualizer } from '../../components/AudioVisualizer';
import './ZumbidoTherapy.css';

export const ZumbidoTherapy: React.FC = () => {
  const navigate = useNavigate();
  const {
    isPlaying,
    frequency,
    setFrequency,
    volume,
    setVolume,
    mode,
    setMode,
    togglePlay,
    analyserRef,
  } = useZumbidoAudioEngine();

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(Number(e.target.value));
  };

  const adjustFreq = (delta: number) => {
    setFrequency((prev) => Math.min(12000, Math.max(150, prev + delta)));
  };

  return (
    <div className="p-4 pb-24 space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        
        <div className="flex items-start gap-3 bg-[#E1F7EE] border-l-4 border-[#1D9E75] p-4 rounded-lg">
          <Headphones className="text-[#1D9E75] flex-shrink-0 mt-1" size={24} />
          <div className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-[#1D9E75] block mb-1">Atenção:</strong> 
            Sugere-se o uso com fones de ouvido. O volume global está limitado por segurança (Diretrizes OMS: máx 60%). Mantenha no nível mais baixo em que o zumbido seja mascarado.
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm transition-colors border ${mode === 'pure-tone' ? 'bg-[#1D9E75] text-white border-[#1D9E75] font-semibold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            onClick={() => setMode('pure-tone')}
          >
            <Activity size={18} /> Pareamento
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm transition-colors border ${mode === 'notch-noise' ? 'bg-[#1D9E75] text-white border-[#1D9E75] font-semibold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            onClick={() => setMode('notch-noise')}
          >
            <Activity size={18} /> Terapia (Notch)
          </button>
        </div>

        <AudioVisualizer analyserRef={analyserRef} isPlaying={isPlaying} />

        <div className="text-center">
          <h2 className="text-4xl font-light text-gray-800">{Math.round(frequency)} Hz</h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frequência Alvo (Blind Spot)</span>
        </div>

        <div className="space-y-4">
          <input 
            type="range" 
            min="150" 
            max="12000" 
            step="1" 
            value={frequency} 
            onChange={handleFreqChange}
            className="zumbido-range"
          />
          <div className="flex justify-center gap-2">
            <button onClick={() => adjustFreq(-10)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors">-10 Hz</button>
            <button onClick={() => adjustFreq(-1)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors">-1 Hz</button>
            <button onClick={() => adjustFreq(1)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors">+1 Hz</button>
            <button onClick={() => adjustFreq(10)} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors">+10 Hz</button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 w-1/2">
            <Volume2 size={20} className="text-gray-400" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))}
              className="zumbido-range"
            />
          </div>

          <button 
            onClick={togglePlay}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all shadow-md active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-[#1D9E75] hover:bg-[#16805E] shadow-[#1D9E75]/30'}`}
          >
            {isPlaying ? (
              <><Square fill="currentColor" size={18} /> Parar</>
            ) : (
              <><Play fill="currentColor" size={18} /> Iniciar</>
            )}
          </button>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 active:scale-95 transition-all w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
