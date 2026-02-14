import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('🚀 Iniciando renderização do app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Elemento root não encontrado");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ App montado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao renderizar o React:', err);
  }
}