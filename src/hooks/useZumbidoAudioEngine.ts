import { useRef, useState, useEffect, useCallback } from 'react';

export type TherapyMode = 'pure-tone' | 'notch-noise';

export const useZumbidoAudioEngine = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(1000);
  const [volume, setVolume] = useState(0.2); // 0.0 to 1.0
  const [mode, setMode] = useState<TherapyMode>('pure-tone');

  const MAX_SAFE_GAIN = 0.6; 

  const initAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      masterGainRef.current = audioCtxRef.current.createGain();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      masterGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
  }, []);

  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate; 
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  };

  const stopAll = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (noiseBufferSourceRef.current) {
      noiseBufferSourceRef.current.stop();
      noiseBufferSourceRef.current.disconnect();
      noiseBufferSourceRef.current = null;
    }
    if (biquadFilterRef.current) {
      biquadFilterRef.current.disconnect();
      biquadFilterRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playPureTone = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    stopAll();

    const osc = audioCtxRef.current.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    osc.connect(masterGainRef.current);
    osc.start();
    oscillatorRef.current = osc;
    setIsPlaying(true);
  }, [frequency, stopAll]);

  const playNotchNoise = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    stopAll();

    const noiseBuffer = createWhiteNoiseBuffer(audioCtxRef.current);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = 'notch';
    filter.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    filter.Q.value = 10;

    source.connect(filter);
    filter.connect(masterGainRef.current);
    
    source.start();
    noiseBufferSourceRef.current = source;
    biquadFilterRef.current = filter;
    setIsPlaying(true);
  }, [frequency, stopAll]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const actualGain = volume * MAX_SAFE_GAIN;
      masterGainRef.current.gain.setTargetAtTime(actualGain, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume]);

  useEffect(() => {
    if (audioCtxRef.current) {
      if (oscillatorRef.current && mode === 'pure-tone') {
        oscillatorRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
      }
      if (biquadFilterRef.current && mode === 'notch-noise') {
        biquadFilterRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
      }
    }
  }, [frequency, mode]);

  const togglePlay = () => {
    if (!audioCtxRef.current) {
      initAudioContext();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      stopAll();
    } else {
      if (mode === 'pure-tone') {
        playPureTone();
      } else {
        playNotchNoise();
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (mode === 'pure-tone') playPureTone();
      if (mode === 'notch-noise') playNotchNoise();
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAll]);

  return {
    isPlaying,
    frequency,
    setFrequency,
    volume,
    setVolume,
    mode,
    setMode,
    togglePlay,
    analyserRef,
  };
};
