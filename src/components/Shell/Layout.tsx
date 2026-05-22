import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { DrawerMenu } from './DrawerMenu';
import { Outlet } from 'react-router-dom';

// Concierge Vivo — self-contained conversational component
import { OttoConciergeDock } from '../../concierge/OttoConciergeDock';

// Micro error boundary to isolate Concierge crashes from breaking the whole app
class ConciergeBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error('[Concierge crash]', err); }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <TopBar onMenuClick={() => setIsMenuOpen(true)} />
      <DrawerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNav />

      {/* Concierge Vivo — isolado com ErrorBoundary dedicado */}
      <ConciergeBoundary>
        <OttoConciergeDock />
      </ConciergeBoundary>
    </div>
  );
};
