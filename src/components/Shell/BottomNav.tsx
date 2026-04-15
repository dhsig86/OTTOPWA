import React from 'react';
import { Home, Search, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-lg border-t border-otto-border/50 flex flex-row items-center justify-around z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 ${
              isActive ? 'text-otto-teal' : 'text-otto-muted hover:text-otto-teal-mid'
            }`}
          >
            <item.icon size={24} className={isActive ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
};
