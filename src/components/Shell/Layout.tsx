import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { DrawerMenu } from './DrawerMenu';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Importa estilos e componentes do Concierge local
import '../../concierge/concierge.css';
import { OttoConciergeDock } from '../../concierge/OttoConciergeDock';
import { simulateCommandActivation } from '../../concierge/core';
import { createPwaLaunchPlan, executePwaLaunchPlan } from '../../concierge/bridge';
import { OTTO_MODULE_REGISTRY, getCalcHubCatalogByArea } from '../../concierge/registry';
import type { ConciergeInput, CommandSimulationResult } from '../../concierge/types';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userName, profile } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [command, setCommand] = useState('calculadora nose');
  const [dockOpen, setDockOpen] = useState(false);
  const [isPendingSim, setIsPendingSim] = useState(false);
  const [result, setResult] = useState<CommandSimulationResult | null>(null);

  // Mapeia calculadora e catalogos
  const calcCatalogByArea = useMemo(() => getCalcHubCatalogByArea(), []);
  const launchPlan = useMemo(() => createPwaLaunchPlan(result), [result]);
  const connectableModules = useMemo(() => OTTO_MODULE_REGISTRY.filter((module) => module.surfaces.includes('pwa')), []);
  
  const conciergeModules = useMemo(
    () => connectableModules.map((module) => ({
      id: module.id,
      name: module.displayName,
      status: module.adapter.status
    })),
    [connectableModules]
  );

  const allowedOrigins = useMemo(() => {
    return connectableModules
      .map((module) => {
        try {
          return new URL(module.currentUrl).origin;
        } catch {
          return undefined;
        }
      })
      .filter((origin): origin is string => typeof origin === 'string');
  }, [connectableModules]);

  const launchExecution = useMemo(
    () => executePwaLaunchPlan(launchPlan, { allowedOrigins }),
    [allowedOrigins, launchPlan]
  );

  const runSimulation = (nextCommand = command) => {
    const trimmed = nextCommand.trim();
    if (!trimmed) return;

    setIsPendingSim(true);
    const input: ConciergeInput = {
      surface: 'pwa',
      input: { kind: 'text', text: trimmed },
      identity: {
        uid: userId || 'anonymous',
        profile: profile || 'medico',
        displayName: userName || 'Medico OTTO',
        verification: {
          status: userId ? 'verified' : 'unverified',
          method: userId ? 'firebase_token' : 'anonymous',
          resolvedBy: userId ? 'pwa_auth' : 'none'
        }
      },
      session: {
        id: `pwa_session_${userId || 'anon'}`,
        timestamp: new Date().toISOString(),
        locale: 'pt-BR'
      }
    };

    simulateCommandActivation(input)
      .then((res) => {
        setResult(res);
        setIsPendingSim(false);
      })
      .catch((err) => {
        console.error('Falha na simulacao de comando', err);
        setIsPendingSim(false);
      });
  };

  const handleExecutePlan = () => {
    if (launchExecution.shouldNavigate && launchExecution.route) {
      if (launchExecution.postMessage?.payload) {
        sessionStorage.setItem(
          'otto_concierge_pending_message',
          JSON.stringify(launchExecution.postMessage.payload)
        );
      }
      navigate(launchExecution.route, { state: launchExecution.navigationState });
      setDockOpen(false);
    }
  };

  const applyQuickAction = (index: number) => {
    const actions = [
      'calculadora nose',
      'tuss septoplastia',
      'abrir protto',
      'transcrever consulta'
    ];
    const act = actions[index] || 'calculadora nose';
    setCommand(act);
    runSimulation(act);
  };

  const applyCalculator = (calculator: { id: string; name: string }) => {
    const act = `abrir ${calculator.name}`;
    setCommand(act);
    runSimulation(act);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <TopBar onMenuClick={() => setIsMenuOpen(true)} />
      <DrawerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNav />

      <OttoConciergeDock
        command={command}
        isOpen={dockOpen}
        isPending={isPendingSim}
        mascotSrc="/otto.png"
        userLabel={userName || 'Medico OTTO'}
        userStatus={`${userId ? 'Autenticado' : 'Sessao Local'} - ${profile || 'medico'}`}
        plan={launchPlan}
        quickActions={[
          { label: 'NOSE' },
          { label: 'Septoplastia TUSS' },
          { label: 'PROTTO' },
          { label: 'Whisper' }
        ]}
        modules={conciergeModules}
        calculatorGroups={calcCatalogByArea}
        onOpenChange={setDockOpen}
        onCommandChange={setCommand}
        onRun={() => runSimulation()}
        onExecutePlan={handleExecutePlan}
        onQuickAction={applyQuickAction}
        onCalculatorSelect={applyCalculator}
      />
    </div>
  );
};
