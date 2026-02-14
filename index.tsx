import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Elemento raiz 'root' não encontrado no DOM.");
}

const root = createRoot(rootElement);
root.render(<App />);

console.log('🚀 Sistema pronto e operando em React 18.2.0');