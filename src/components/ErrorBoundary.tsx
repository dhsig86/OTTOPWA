import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('OTTO ErrorBoundary caught:', error, info);

    // Captura falhas de importação de chunks dinâmicos ou incompatibilidade de hash pós-deploy
    const isChunkError = 
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.name === 'ChunkLoadError' ||
      error.message?.toLowerCase().includes('chunk') ||
      error.message?.toLowerCase().includes('mime type');

    if (isChunkError) {
      console.warn('Falha de chunk estático capturada pelo ErrorBoundary. Recarregando...');
      const lastReload = sessionStorage.getItem('otto_chunk_reload');
      const now = Date.now();

      // Evita loops infinitos de recarregamento
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('otto_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Algo deu errado</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Um erro inesperado ocorreu neste módulo.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-6 py-3 bg-[#1D9E75] text-white font-bold rounded-xl"
          >
            Voltar para o início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
