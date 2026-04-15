import React from 'react';
import { Home, Search, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Busca', path: '/search' },
    { icon: Bell, label: 'Notificações', path: '/notifications' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-otto-border flex items-center justify-around z-40 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
              isActive ? 'text-otto-teal' : 'text-otto-muted hover:text-otto-teal-mid'
            }`}
          >
            <item.icon size={24} className={isActive ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
