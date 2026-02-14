import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // Sinaliza para o index.html que o app carregou
    (window as any).__APP_READY__ = true;
  } catch (error) {
    console.error("Erro ao renderizar App:", error);
  }
}