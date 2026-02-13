import React, { useState, useEffect, useRef } from 'react';
import { AppData, ViewState } from './types.ts';
import { DEFAULT_DATA, STORAGE_KEY } from './constants.ts';
import Dashboard from './components/Dashboard.tsx';
import BudgetManager from './components/BudgetManager.tsx';
import GuestList from './components/GuestList.tsx';
import VendorList from './components/VendorList.tsx';
import Settings from './components/Settings.tsx';
import BottomNav from './components/BottomNav.tsx';

const App: React.FC = () => {
  const FIREBASE_URL = 'https://ben-faz-1-default-rtdb.firebaseio.com/eventData.json';
  
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'fetching'>('idle');
  
  const dataRef = useRef<AppData>(data);
  const isInitialMount = useRef(true);
  const lastChangeTime = useRef<number>(Date.now());

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const initData = async () => {
      setSyncStatus('fetching');
      try {
        const response = await fetch(FIREBASE_URL);
        if (response.ok) {
          const remoteData = await response.json();
          if (remoteData) {
            setData(remoteData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
          } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setData(JSON.parse(saved));
          }
        }
      } catch (e) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setData(JSON.parse(saved));
      } finally {
        setLoading(false);
        setSyncStatus('idle');
        isInitialMount.current = false;
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        await fetch(FIREBASE_URL, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.error("Erro ao salvar");
      } finally {
        setSyncStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (Date.now() - lastChangeTime.current < 5000) return;
      try {
        const response = await fetch(FIREBASE_URL);
        if (response.ok) {
          const remoteData = await response.json();
          if (remoteData && JSON.stringify(remoteData) !== JSON.stringify(dataRef.current)) {
            setData(remoteData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
          }
        }
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateData = (newData: AppData) => {
    lastChangeTime.current = Date.now();
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Sincronizando festa...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="h-1 w-full bg-slate-100 fixed top-0 z-[60] overflow-hidden">
        {syncStatus === 'saving' && <div className="h-full bg-brand-500 animate-pulse w-full"></div>}
        {syncStatus === 'fetching' && <div className="h-full bg-green-500 animate-[loading_1s_infinite] w-1/3"></div>}
      </div>
      <main className="max-w-md mx-auto min-h-screen relative px-4 pt-6 pb-32">
        {currentView === 'dashboard' && <Dashboard data={data} />}
        {currentView === 'budget' && <BudgetManager data={data} onUpdate={updateData} />}
        {currentView === 'guests' && <GuestList data={data} onUpdate={updateData} />}
        {currentView === 'vendors' && <VendorList data={data} onUpdate={updateData} />}
        {currentView === 'settings' && <Settings data={data} onUpdate={updateData} />}
      </main>
      <BottomNav currentView={currentView} setView={setCurrentView} />
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default App;