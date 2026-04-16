import React, { useState, useRef } from 'react';
import { Volume2, Play, Square, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ZumbidoTherapy: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const toggleWhiteNoise = () => {
    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const ctx = new window.AudioContext();
      audioCtxRef.current = ctx;
      
      const bufferSize = ctx.sampleRate * 30; // 30 segundos
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true; // Auto loop forever until stopped
      
      // Gain node for soft volume
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15; // Soft volume for white noise

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center space-y-6">
        <div className="w-20 h-20 bg-[#E1F7EE] text-[#0A865F] rounded-full flex items-center justify-center mx-auto mb-2 relative">
          {isPlaying && <span className="absolute inset-0 bg-[#E1F7EE] rounded-full animate-ping opacity-50"></span>}
          <Volume2 size={40} className="relative z-10" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-800">Terapia de Zumbido</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sons terapêuticos e ruído branco para alívio diário.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-sm">
              <Waves className="text-[#1D9E75]" size={24} />
            </div>
            <div className="text-left">
              <span className="block font-semibold text-sm text-gray-800">Ruído Branco</span>
              <span className="text-[10px] text-gray-500 uppercase">Loop Contínuo</span>
            </div>
          </div>
          <button 
            onClick={toggleWhiteNoise}
            className={`h-10 w-10 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1D9E75] hover:bg-[#0A865F]'}`}
          >
            {isPlaying ? <Square size={16} /> : <Play size={20} className="ml-1" />}
          </button>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 border border-otto-border text-otto-text font-medium rounded-lg hover:bg-gray-50 active:scale-95 transition-all w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
