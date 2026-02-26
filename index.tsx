import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🚀 Iniciando renderização do App...");

const container = document.getElementById('root');
if (container) {
  try {
    console.log("📦 Container encontrado, criando root...");
    const root = createRoot(container);
    
    console.log("🎨 Renderizando App...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Sinaliza para o index.html que o app carregou
    (window as any).__APP_READY__ = true;
    console.log("✅ App renderizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao renderizar App:", error);
    (window as any).__APP_READY__ = true; // Force ready mesmo com erro
    
    // Fallback visual em caso de erro
    container.innerHTML = `
      <div style="padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
        <div style="background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; max-width: 320px;">
          <h1 style="color: #e11d48; font-weight: 800; font-size: 20px; margin-bottom: 8px;">Erro ao Carregar</h1>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">Houve um problema ao iniciar o aplicativo.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 24px; font-family: monospace; word-break: break-all;">${String(error).slice(0, 100)}</p>
          <button onclick="window.location.reload(true)" style="background: #0ea5e9; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; width: 100%; cursor: pointer; -webkit-appearance: none;">Tentar Novamente</button>
        </div>
      </div>
    `;
  }
} else {
  console.error("❌ Container 'root' não encontrado no DOM!");
}
