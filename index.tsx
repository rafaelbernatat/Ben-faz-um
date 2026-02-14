import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('📡 [Boot] Iniciando index.tsx...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ [Boot] Elemento #root não encontrado!');
  throw new Error("Elemento raiz 'root' não encontrado no DOM.");
}

try {
  console.log('🏗️ [Boot] Criando root do React...');
  const root = createRoot(rootElement);
  
  console.log('🚀 [Boot] Renderizando App...');
  root.render(<App />);
  
  console.log('✅ [Boot] Sistema montado com sucesso (React 18.2.0)');
} catch (error) {
  console.error('💥 [Boot] Erro fatal durante a renderização:', error);
  // Garante que o erro apareça na tela se o index.html não capturar
  rootElement.innerHTML = `<div style="color:red; padding:20px;">Erro Fatal React: ${error.message}</div>`;
}
