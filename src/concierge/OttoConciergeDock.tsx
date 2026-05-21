import React from 'react';
import { Bot, ChevronDown, LockKeyhole, Play, Sparkles, X } from 'lucide-react';
import type { PwaLaunchPlan } from './bridge';
import { OTTO_TUTORIALS } from './tutorials';

export interface ConciergeCalculatorSummary {
  id: string;
  name: string;
}

export interface ConciergeCalculatorGroup {
  area: string;
  calculators: ConciergeCalculatorSummary[];
}

export interface ConciergeModuleSummary {
  id: string;
  name: string;
  status: string;
}

export interface ConciergeQuickAction {
  label: string;
}

export interface OttoConciergeDockProps {
  command: string;
  isOpen: boolean;
  isPending: boolean;
  mascotSrc?: string;
  userLabel: string;
  userStatus: string;
  plan: PwaLaunchPlan;
  quickActions: ConciergeQuickAction[];
  modules: ConciergeModuleSummary[];
  calculatorGroups: ConciergeCalculatorGroup[];
  onOpenChange: (isOpen: boolean) => void;
  onCommandChange: (command: string) => void;
  onRun: () => void;
  onExecutePlan: () => void;
  onQuickAction: (index: number) => void;
  onCalculatorSelect: (calculator: ConciergeCalculatorSummary) => void;
}

export const OttoConciergeDock: React.FC<OttoConciergeDockProps> = ({
  command,
  isOpen,
  isPending,
  mascotSrc,
  userLabel,
  userStatus,
  plan,
  quickActions,
  modules,
  calculatorGroups,
  onOpenChange,
  onCommandChange,
  onRun,
  onExecutePlan,
  onQuickAction,
  onCalculatorSelect
}) => {
  return (
    <div className="otto-concierge-layer" aria-label="OTTO Concierge no PWA">
      <button
        className={`concierge-fab ${plan.status}`}
        type="button"
        aria-label="Abrir OTTO Concierge"
        aria-expanded={isOpen}
        aria-controls="otto-concierge-panel"
        onClick={() => onOpenChange(!isOpen)}
      >
        {mascotSrc ? <img src={mascotSrc} alt="" aria-hidden="true" /> : <Bot aria-hidden="true" />}
        <span>OTTO Concierge</span>
        <small aria-hidden="true">{plan.status}</small>
      </button>

      {isOpen ? (
        <aside id="otto-concierge-panel" className="concierge-dock" aria-label="Painel do OTTO Concierge">
          <header className="concierge-dock-header">
            <div>
              <span>Helper do PWA</span>
              <strong>Posso ajudar ou prefere me dispensar por enquanto?</strong>
            </div>
            <button type="button" aria-label="Fechar OTTO Concierge" onClick={() => onOpenChange(false)}>
              <X aria-hidden="true" />
            </button>
          </header>

          <section className="concierge-butler-greeting" aria-label="Saudacao do mordomo OTTO">
            {mascotSrc ? <img src={mascotSrc} alt="" aria-hidden="true" /> : <Bot aria-hidden="true" />}
            <div>
              <strong>Estou a porta.</strong>
              <p>Posso abrir um modulo, preparar um contexto ou ficar quietinho ate voce chamar.</p>
              <button type="button" onClick={() => onOpenChange(false)}>
                Dispensar por enquanto
              </button>
            </div>
          </section>

          <section className="concierge-user-strip" aria-label="Usuario reconhecido">
            <LockKeyhole aria-hidden="true" />
            <div>
              <strong>{userLabel}</strong>
              <span>{userStatus}</span>
            </div>
          </section>

          <label className="concierge-command">
            <span>Pedido ao Concierge</span>
            <textarea
              value={command}
              rows={4}
              onChange={(event) => onCommandChange(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') onRun();
              }}
            />
          </label>

          <button className="concierge-run" type="button" disabled={isPending} onClick={onRun}>
            <Play aria-hidden="true" />
            {isPending ? 'Preparando' : 'Preparar abertura'}
          </button>

          <section className="concierge-mini-plan" aria-label="Resumo do plano PWA">
            <div>
              <Sparkles aria-hidden="true" />
              <strong>{plan.actionLabel}</strong>
            </div>
            <p>{plan.helperMessage}</p>
            <dl>
              <div>
                <dt>Modulo</dt>
                <dd>{plan.moduleName ?? plan.moduleId ?? 'aguardando'}</dd>
              </div>
              <div>
                <dt>Rota</dt>
                <dd>{plan.route ?? 'n/a'}</dd>
              </div>
            </dl>
            {plan.status !== 'idle' && plan.status !== 'blocked' && (
              <button
                className="concierge-execute-plan-btn"
                type="button"
                onClick={onExecutePlan}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '10px',
                  background: '#26745f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {plan.actionLabel}
              </button>
            )}
          </section>

          <section className="concierge-shortcuts" aria-label="Atalhos do Concierge">
            <h3>Atalhos</h3>
            <div>
              {quickActions.map((action, index) => (
                <button key={action.label} type="button" onClick={() => onQuickAction(index)}>
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          <section className="concierge-module-list" aria-label="Modulos disponiveis no PWA">
            <h3>Modulos</h3>
            {modules.map((module) => (
              <div key={module.id}>
                <span>{module.name}</span>
                <small>{module.status}</small>
              </div>
            ))}
          </section>

          <section className="concierge-tutorials" aria-label="Tutoriais de uso do sistema">
            <h3>Manual & Tutoriais</h3>
            {OTTO_TUTORIALS.map((tutorial) => (
              <details key={tutorial.id} className="concierge-tutorial-item">
                <summary>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{tutorial.emoji}</span>
                    <span>{tutorial.title}</span>
                  </span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <div className="concierge-tutorial-content" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '4px' }}>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', lineHeight: '1.4' }}>{tutorial.summary}</p>
                  
                  <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold', marginBottom: '8px' }}>
                    Público-alvo: <span style={{ color: '#d1d5db', fontWeight: 'normal' }}>{tutorial.audience}</span>
                  </div>

                  <ol style={{ paddingLeft: '0', listStyle: 'none', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tutorial.steps.map((step, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#d1d5db', lineHeight: '1.4' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#312e81', color: '#a5b4fc', borderRadius: '50%', fontSize: '10px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>{idx + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div style={{ background: 'rgba(16,185,129,0.05)', borderLeft: '3px solid #10b981', padding: '8px', borderRadius: '0 6px 6px 0', fontSize: '10px', color: '#a7f3d0', margin: '12px 0 8px 0', lineHeight: '1.4' }}>
                    <strong>💡 Dica:</strong> {tutorial.tip}
                  </div>

                  <button 
                    type="button" 
                    className="tutorial-test-btn"
                    onClick={() => {
                      onCommandChange(tutorial.shortcutCommand);
                      onOpenChange(true);
                      setTimeout(() => {
                        onRun();
                      }, 120);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '8px',
                      padding: '6px 12px',
                      background: '#312e81',
                      color: '#a5b4fc',
                      border: '1px solid #4338ca',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Play size={10} aria-hidden="true" />
                    Testar Ferramenta
                  </button>
                </div>
              </details>
            ))}
          </section>

          <section className="concierge-calc-areas" aria-label="Calculadoras por area no Concierge">
            <h3>CALC-HUB</h3>
            {calculatorGroups.map((group) => (
              <details key={group.area}>
                <summary>
                  <span>{group.area}</span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <div>
                  {group.calculators.map((calculator) => (
                    <button key={calculator.id} type="button" onClick={() => onCalculatorSelect(calculator)}>
                      {calculator.name}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </section>
        </aside>
      ) : null}
    </div>
  );
};
