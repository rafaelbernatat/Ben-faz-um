import React, { useState, useEffect, useRef } from 'react';
import { AppData, ViewState } from './types';
import { DEFAULT_DATA, STORAGE_KEY } from './constants';
import Dashboard from './components/Dashboard';
import BudgetManager from './components/BudgetManager';
import GuestList from './components/GuestList';
import VendorList from './components/VendorList';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';

const FIREBASE_URL = 'https://ben-faz-1-default-rtdb.firebaseio.com/eventData.json';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'fetching'>('idle');
  
  const isInitialMount = useRef(true);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      // 1. Tentar ler do Cache Local primeiro para ser instantâneo
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setData(JSON.parse(saved));
          setLoading(false);
        } catch (e) { console.error("Erro no cache", e); }
      }

      // 2. Buscar da Nuvem em Background
      setSyncStatus('fetching');
      try {
        const res = await fetch(FIREBASE_URL);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData) {
            setData(cloudData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          }
        }
      } catch (e) {
        console.warn("Offline ou Erro Firebase");
      } finally {
        setLoading(false);
        setSyncStatus('idle');
        isInitialMount.current = false;
      }
    };
    init();
  }, []);

  // Sincronização Automática (Debounce de 2s)
  useEffect(() => {
    if (isInitialMount.current || loading) return;

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        await fetch(FIREBASE_URL, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Erro ao salvar remoto");
      } finally {
        setSyncStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data]);

  const updateData = (newData: AppData) => setData(newData);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Sincronizando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Indicador de Sync Discreto */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
        {syncStatus === 'saving' && <div className="h-full bg-brand-500 animate-pulse w-full"></div>}
        {syncStatus === 'fetching' && <div className="h-full bg-green-500 w-1/3 animate-[loading_1.5s_infinite]"></div>}
      </div>

      <main className="max-w-md mx-auto min-h-screen px-4 pt-6 pb-28">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentView === 'dashboard' && <Dashboard data={data} />}
          {currentView === 'budget' && <BudgetManager data={data} onUpdate={updateData} />}
          {currentView === 'guests' && <GuestList data={data} onUpdate={updateData} />}
          {currentView === 'vendors' && <VendorList data={data} onUpdate={updateData} />}
          {currentView === 'settings' && <Settings data={data} onUpdate={updateData} />}
        </div>
      </main>

      <BottomNav currentView={currentView} setView={setCurrentView} />

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;