import { useState, useRef, useEffect } from 'react';
import { Play, Square, Volume2, AudioLines, Music } from 'lucide-react';

export function TinnitusSynthesizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(4000);
  const [volume, setVolume] = useState(0.5); 

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const SAFE_MAX_GAIN = 0.8;

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
  };

  const toggleTone = () => {
    initAudio();
    
    if (isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      setIsPlaying(false);
    } else {
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * SAFE_MAX_GAIN, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsPlaying(true);
        
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }
  };

  useEffect(() => {
    if (audioCtxRef.current && isPlaying) {
      const ctx = audioCtxRef.current;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(volume * SAFE_MAX_GAIN, ctx.currentTime, 0.05);
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.05);
      }
    }
  }, [volume, frequency, isPlaying]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AudioLines className="w-24 h-24 text-[#1D9E75]" />
        </div>
        
        <h2 className="text-xl font-extrabold text-slate-800 mb-2 relative z-10">Sintetizador de Zumbido</h2>
        <p className="text-sm text-slate-500 mb-6 relative z-10">Ajuste a frequência (Hz) para encontrar o tom (Pitch) mais parecido com o seu zumbido.</p>

        <div className="mb-8 relative z-10">
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-slate-700">Frequência (Tom)</label>
            <span className="font-mono font-bold text-[#1D9E75] bg-[#E1F7EE] px-2 py-1 rounded-md text-sm">{frequency} Hz</span>
          </div>
          <input 
            type="range" 
            min="125" max="12000" step="10"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#1D9E75' }}
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
            <span>Grave (125 Hz)</span>
            <span>Agudo (12.000 Hz)</span>
          </div>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" /> Volume de Mistura
            </label>
            <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-sm">{Math.round(volume * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#475569' }}
          />
          <p className="text-[10px] text-[#1D9E75] mt-2 font-medium">Lembrete: O volume do celular deve ser confortável.</p>
        </div>

        <div className="flex justify-center relative z-10 pt-4 border-t border-slate-100">
          <button
            onClick={toggleTone}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isPlaying 
                ? 'bg-red-50 text-red-500 border-4 border-red-100 hover:bg-red-100 hover:scale-95' 
                : 'bg-[#1D9E75] text-white border-4 border-[#8ce3c7] hover:bg-[#16805E] hover:scale-105'
            }`}
          >
            {isPlaying ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-500" /> Som de Referência
        </h3>
        <p className="text-xs text-slate-500 mb-4">Ouça o som clássico de zumbido agudo contínuo (~7500 Hz).</p>
        
        <div className="bg-slate-50 rounded-xl p-2 border border-slate-200">
          <video 
            ref={videoRef}
            controls 
            controlsList="nodownload nofullscreen"
            className="w-full h-12 outline-none rounded-lg"
            onPlay={() => {
              if (isPlaying) toggleTone();
            }}
          >
            <source src="/tinnitus_7500hz.mp4" type="video/mp4" />
            Seu navegador não suporta a reprodução.
          </video>
        </div>
      </div>
    </div>
  );
}
