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
  
  // Marca como carregado com sucesso para o index.html parar o timeout
  (window as any).__APP_READY__ = true;
  console.log('✅ [Boot] Sistema montado com sucesso');
} catch (error: any) {
  console.error('💥 [Boot] Erro fatal:', error);
  rootElement.innerHTML = `<div style="color:red; padding:20px; border:2px solid red; margin:20px; border-radius:8px;">
    <b>Erro Fatal React:</b><br>${error.message || error}
  </div>`;
}
