import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Wallet, Users, Store, Settings } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems: { view: ViewState; label: string; icon: React.FC<any> }[] = [
    { view: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { view: 'budget', label: 'Tarefas', icon: Wallet },
    { view: 'guests', label: 'Convidados', icon: Users },
    { view: 'vendors', label: 'Fornecedores', icon: Store },
    { view: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-2 shadow-2xl z-50">
      <div className="flex justify-around items-end pb-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-full py-1 transition-colors duration-200 ${
                isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;