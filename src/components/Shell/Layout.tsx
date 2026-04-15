import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { DrawerMenu } from './DrawerMenu';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-otto-surface flex flex-col pt-16 pb-16">
      <TopBar onMenuClick={() => setIsMenuOpen(true)} />
      <DrawerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};
