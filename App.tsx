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

  // Mantém a referência de dados atualizada para o salvamento automático
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const initData = async () => {
      setSyncStatus('fetching');
      
      // 1. Prioridade Máxima: Carregar cache local imediatamente para evitar tela branca
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setData(parsed);
          setLoading(false); // Já temos dados, remove o loader
        } catch(e) {
          console.error("Erro ao ler cache local", e);
        }
      }

      // 2. Tentar sincronizar com a nuvem (Firebase)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // Timeout agressivo de 3.5s

      try {
        const response = await fetch(FIREBASE_URL, { signal: controller.signal });
        if (response.ok) {
          const remoteData = await response.json();
          if (remoteData) {
            setData(remoteData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
          }
        }
      } catch (e) {
        console.warn("Rede instável ou Firebase offline. Operando em modo local.");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false); // Força a saída do loading independentemente do resultado
        setSyncStatus('idle');
        // Pequeno atraso para garantir que o React processou a primeira montagem
        setTimeout(() => { isInitialMount.current = false; }, 100);
      }
    };
    initData();
  }, []);

  // Efeito de Salvamento Automático (Debounce)
  useEffect(() => {
    if (isInitialMount.current || loading) return;

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        await fetch(FIREBASE_URL, {
          method: 'PUT',
          body: JSON.stringify(dataRef.current)
        });
      } catch (e) {
        console.error("Falha ao sincronizar alterações na nuvem");
      } finally {
        setSyncStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, loading]);

  const updateData = (newData: AppData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium text-sm animate-pulse">Sincronizando dados...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Barra de Status de Sincronização */}
      <div className="h-1 fixed top-0 left-0 right-0 z-[100] overflow-hidden bg-transparent">
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