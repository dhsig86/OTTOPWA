import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const renderFrame = () => {
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas (transparente ou cinza muito escuro para combinar com o card)
      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.fillStyle = '#0A0A0A'; // Dark background
      canvasCtx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Verde OTTO paleta (#1D9E75 -> rgba)
        const g = barHeight + (25 * (i / bufferLength));
        canvasCtx.fillStyle = `rgb(29, ${Math.min(158, 50 + g)}, 117)`;
        
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      if (isPlaying) {
        requestRef.current = requestAnimationFrame(renderFrame);
      }
    };

    if (isPlaying) {
      renderFrame();
    } else {
      // Draw a flat line when stopped
      canvasCtx.fillStyle = '#0A0A0A';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.fillStyle = '#1D9E75';
      canvasCtx.fillRect(0, canvas.height - 1, canvas.width, 2);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, analyserRef]);

  return (
    <div className="w-full h-32 bg-[#0A0A0A] rounded-lg overflow-hidden border border-gray-800">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={128} 
        className="w-full h-full block"
      />
    </div>
  );
};
