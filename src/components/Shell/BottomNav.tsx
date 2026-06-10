import React, { useEffect, useRef } from 'react';
import { Home, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as _anime from 'animejs';
const anime = (_anime as any).default || _anime;

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const conciergeRef = useRef<HTMLDivElement | null>(null);

  // Efeito periódico discreto para atrair atenção ao Concierge Assistente
  useEffect(() => {
    const interval = setInterval(() => {
      if (conciergeRef.current) {
        anime({
          targets: conciergeRef.current,
          translateY: [0, -6, 0],
          scale: [1, 1.05, 1],
          duration: 900,
          easing: 'elastic(1, .5)',
        });
      }
    }, 10000); // Executa a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const triggerClickAnimation = () => {
    if (conciergeRef.current) {
      anime({
        targets: conciergeRef.current,
        rotate: '1turn',
        scale: [1, 1.2, 1],
        duration: 850,
        easing: 'spring(1, 80, 10, 0)',
      });
    }
  };

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Concierge', path: '/concierge' },
    { label: 'Perfil', path: '/profile' },
  ];

  const iconMap: Record<string, React.ComponentType<any>> = {
    'Início': Home,
    'Perfil': User,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex flex-row items-center justify-around z-40 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
        const Icon = iconMap[item.label];

        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={item.label}
            onClick={() => {
              if (item.label === 'Concierge') {
                triggerClickAnimation();
                window.dispatchEvent(new CustomEvent('otto-open-concierge'));
              } else {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-300 ${
              isActive ? 'text-[#1D9E75]' : 'text-gray-400 hover:text-[#1D9E75]'
            }`}
          >
            {item.label === 'Concierge' ? (
              <div
                ref={conciergeRef}
                className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-[#1D9E75] scale-110 shadow-sm' : 'border-gray-300'} transition-all duration-300`}
              >
                <img src="/otto_concierge_avatar.jpg" alt="Concierge" className="w-full h-full object-cover" />
              </div>
            ) : (
              Icon && <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            )}
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <div className="w-1 h-1 rounded-full bg-[#1D9E75] mt-0.5" />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

