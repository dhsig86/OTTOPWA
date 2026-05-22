import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { DrawerMenu } from './DrawerMenu';
import { Outlet } from 'react-router-dom';

// Concierge Vivo — self-contained conversational component
import { OttoConciergeDock } from '../../concierge/OttoConciergeDock';

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

      {/* Concierge Vivo — FAB + Chat Panel */}
      <OttoConciergeDock />
    </div>
  );
};
