import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: '🏠',
      activeIcon: '🏠'
    },
    {
      path: '/chores',
      label: 'Chores',
      icon: '📋',
      activeIcon: '📋'
    },
    {
      path: '/earnings',
      label: 'Earnings',
      icon: '💰',
      activeIcon: '💰'
    },
    {
      path: '/rewards',
      label: 'Rewards',
      icon: '🎁',
      activeIcon: '🎁'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 ${
              isActive(item.path)
                ? 'text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-2xl mb-1">
              {isActive(item.path) ? item.activeIcon : item.icon}
            </span>
            <span className="text-xs font-medium leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;