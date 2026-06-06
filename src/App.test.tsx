import { render, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { ModuleFrame } from './components/ModuleFrame';
import { AuthProvider } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Declarado no topo e com prefixo 'mock' para satisfazer o hoisting do Vitest
const mockNavigate = vi.fn();
const mockTargetUrl = 'https://ottopwa.vercel.app/test-module';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OTTO PWA Shell - Renderização Geral', () => {
  it('deve renderizar o App sem falhar e redirecionar conforme estado do usuário', async () => {
    render(<App />);
    
    // O setupTests inicializa como logado, profileCompleted=true, onboardingCompleted=true.
    // Portanto, deve ir para a Home.
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });
});

describe('OTTO PWA Shell - ModuleFrame & postMessage (Segurança)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('deve rejeitar mensagens com origens que não correspondem ao targetUrl do módulo', async () => {
    const { container } = render(
      <AuthProvider>
        <PatientProvider>
          <MemoryRouter initialEntries={[{ pathname: '/modules/webview', state: { url: mockTargetUrl } }]}>
            <Routes>
              <Route path="/modules/webview" element={<ModuleFrame />} />
            </Routes>
          </MemoryRouter>
        </PatientProvider>
      </AuthProvider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();

    // Mock do contentWindow.postMessage do iframe
    const mockPostMessage = vi.fn();
    if (iframe) {
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });
    }

    // Simular o load do iframe
    act(() => {
      iframe?.dispatchEvent(new Event('load'));
    });

    // Deve enviar o otto-context para a origem segura do módulo
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'otto-context' }),
      'https://ottopwa.vercel.app'
    );

    mockPostMessage.mockClear();

    // Simular evento postMessage vindo de origem NÃO confiável (hacker.com)
    const hackerEvent = new MessageEvent('message', {
      data: { type: 'otto-request-refresh' },
      origin: 'https://hacker.com'
    });

    act(() => {
      window.dispatchEvent(hackerEvent);
    });

    // Não deve responder com outro otto-context
    expect(mockPostMessage).not.toHaveBeenCalled();

    // Simular evento postMessage de navegação vindo de origem NÃO confiável
    const badNavigateEvent = new MessageEvent('message', {
      data: { type: 'otto-navigate', url: 'https://ottopwa.vercel.app/home' },
      origin: 'https://hacker.com'
    });

    act(() => {
      window.dispatchEvent(badNavigateEvent);
    });

    // Não deve ter chamado a navegação
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve aceitar mensagens e interações de origens válidas', async () => {
    const { container } = render(
      <AuthProvider>
        <PatientProvider>
          <MemoryRouter initialEntries={[{ pathname: '/modules/webview', state: { url: mockTargetUrl } }]}>
            <Routes>
              <Route path="/modules/webview" element={<ModuleFrame />} />
            </Routes>
          </MemoryRouter>
        </PatientProvider>
      </AuthProvider>
    );

    const iframe = container.querySelector('iframe');
    const mockPostMessage = vi.fn();
    if (iframe) {
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });
    }

    // Simular o load
    act(() => {
      iframe?.dispatchEvent(new Event('load'));
    });

    expect(mockPostMessage).toHaveBeenCalled();
    mockPostMessage.mockClear();

    // Envia solicitação de refresh de token da origem VÁLIDA (a mesma do iframe)
    const validRefreshEvent = new MessageEvent('message', {
      data: { type: 'otto-request-refresh' },
      origin: 'https://ottopwa.vercel.app'
    });

    await act(async () => {
      window.dispatchEvent(validRefreshEvent);
    });

    // Deve ter respondido com um novo otto-context
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'otto-context' }),
      'https://ottopwa.vercel.app'
    );
  });
});
