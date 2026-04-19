import React from 'react';
import { Home, User, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex flex-row items-center justify-around z-40 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 ${
              isActive ? 'text-[#1D9E75]' : 'text-gray-400 hover:text-[#1D9E75]'
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
