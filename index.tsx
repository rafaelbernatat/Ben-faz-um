import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('🏁 [Index] Iniciando script...');

const container = document.getElementById('root');

if (!container) {
  console.error('❌ [Index] Div #root não encontrada!');
} else {
  try {
    console.log('🏗️ [Index] Criando root...');
    const root = createRoot(container);
    
    console.log('✨ [Index] Renderizando App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Fix: Casting window to any to allow custom property assignment without TypeScript error
    (window as any).__APP_READY__ = true;
    console.log('🚀 [Index] Renderização disparada com sucesso!');
  } catch (err) {
    console.error('💥 [Index] Erro durante render inicial:', err);
  }
}