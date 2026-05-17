import { useState, useRef, useEffect } from 'react';
import { Play, Square, Waves, Volume2 } from 'lucide-react';

type NoiseType = 'white' | 'pink' | 'brown';

export function SoundTherapy() {
  const [playingNoise, setPlayingNoise] = useState<NoiseType | null>(null);
  const [volume, setVolume] = useState(0.5);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const SAFE_MAX_GAIN = 0.8;

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
  };

  const createNoiseBuffer = (ctx: AudioContext, type: NoiseType) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }

    return buffer;
  };

  const toggleNoise = (type: NoiseType) => {
    initAudio();
    const ctx = audioCtxRef.current!;

    if (playingNoise === type) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
      setPlayingNoise(null);
    } else {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }

      const buffer = createNoiseBuffer(ctx, type);
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();

      source.buffer = buffer;
      source.loop = true;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * SAFE_MAX_GAIN, ctx.currentTime + 0.5);

      source.connect(gain);
      gain.connect(ctx.destination);
      
      source.start();

      sourceRef.current = source;
      gainNodeRef.current = gain;
      setPlayingNoise(type);
    }
  };

  useEffect(() => {
    if (audioCtxRef.current && playingNoise && gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume * SAFE_MAX_GAIN, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume, playingNoise]);

  const noiseOptions = [
    { type: 'white', label: 'Ruído Branco', desc: 'Som semelhante a TV fora do ar. Cobre espectro amplo.', color: 'slate' },
    { type: 'pink', label: 'Ruído Rosa', desc: 'Som semelhante à chuva forte ou cachoeira.', color: 'pink' },
    { type: 'brown', label: 'Ruído Marrom', desc: 'Som grave semelhante às ondas do mar revolto.', color: 'amber' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-800 mb-2 flex items-center gap-2">
          <Waves className="w-6 h-6 text-[#1D9E75]" /> Terapia Sonora
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Use os ruídos de banda larga abaixo para enriquecer seu ambiente sonoro. Encontre o ponto de mistura adequado.
        </p>

        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between mb-2">
            <label className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" /> Volume de Terapia
            </label>
            <span className="font-mono font-bold text-slate-500 text-sm">{Math.round(volume * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#1D9E75' }}
          />
        </div>

        <div className="space-y-3">
          {noiseOptions.map((opt) => {
            const isPlaying = playingNoise === opt.type;
            const isPink = opt.type === 'pink';
            const isBrown = opt.type === 'brown';
            
            let colorCls = 'border-slate-200 bg-white hover:border-slate-300 text-slate-700';
            let btnCls = 'bg-slate-100 text-slate-500 hover:bg-slate-200';
            
            if (isPlaying) {
              if (isPink) { colorCls = 'border-pink-300 bg-pink-50 text-pink-900'; btnCls = 'bg-pink-500 text-white'; }
              else if (isBrown) { colorCls = 'border-amber-300 bg-amber-50 text-amber-900'; btnCls = 'bg-amber-500 text-white'; }
              else { colorCls = 'border-[#8ce3c7] bg-[#E1F7EE] text-[#0a4a35]'; btnCls = 'bg-[#1D9E75] text-white'; }
            }

            return (
              <div key={opt.type} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${colorCls}`}>
                <div className="pr-4">
                  <h3 className="font-bold text-base leading-tight">{opt.label}</h3>
                  <p className={`text-[11px] leading-tight mt-1 ${isPlaying ? 'opacity-80' : 'text-slate-500'}`}>
                    {opt.desc}
                  </p>
                </div>
                <button
                  onClick={() => toggleNoise(opt.type)}
                  className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-90 ${btnCls}`}
                >
                  {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
