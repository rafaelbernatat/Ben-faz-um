# 🎉 Planejador de Eventos - Ben-faz-um

Aplicação web para planejamento e organização de eventos, com foco em festas infantis. Desenvolvido com React, TypeScript e integração com Firebase Realtime Database.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral do evento com contagem de convidados e orçamento
- **Gerenciador de Orçamento**: Controle financeiro por categorias
- **Lista de Convidados**: Gerenciamento de RSVPs e contagem de adultos/crianças
- **Lista de Fornecedores**: Comparação de orçamentos de diferentes fornecedores
- **Configurações**: Edição dos detalhes do evento
- **Sincronização Automática**: Dados sincronizados com Firebase e cache local

## 🛠️ Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização via CDN
- **Firebase Realtime Database** - Persistência de dados
- **LocalStorage** - Cache local para acesso offline

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 🌐 Deploy na Vercel

### Deploy Automático (Recomendado)

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe seu repositório
5. A Vercel detectará automaticamente as configurações do Vite
6. Clique em "Deploy"

### Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

## 📁 Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── BudgetManager.tsx
│   ├── GuestList.tsx
│   ├── VendorList.tsx
│   ├── Settings.tsx
│   └── BottomNav.tsx
├── App.tsx             # Componente principal
├── index.tsx           # Entry point
├── types.ts            # Definições de tipos
├── constants.ts        # Dados padrão e constantes
├── index.html          # HTML base
├── vite.config.ts      # Configuração do Vite
├── tsconfig.json       # Configuração do TypeScript
└── vercel.json         # Configuração da Vercel

```

## 🔧 Configuração do Firebase

O app usa Firebase Realtime Database + Google Auth.

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o **Authentication > Google**
3. Ative o **Realtime Database**
4. Preencha o arquivo `.env` com base no `.env.example`

Exemplo de `.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
VITE_ALLOWED_EMAILS=seuemail@gmail.com,esposa@gmail.com
```

### Regras recomendadas (Realtime Database)

No console do Realtime Database, configure regras para permitir acesso apenas a dois UIDs:

```json
{
  "rules": {
    ".read": "auth != null && (auth.uid === 'UID_1' || auth.uid === 'UID_2')",
    ".write": "auth != null && (auth.uid === 'UID_1' || auth.uid === 'UID_2')"
  }
}
```

## 🎨 Personalização

O tema do aplicativo pode ser personalizado editando as cores no [index.html](index.html#L34-L40):

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
      },
    },
  },
};
```

## 📱 PWA Ready

O aplicativo está otimizado para dispositivos móveis com:

- Viewport configurado para mobile
- Meta tags para iOS
- Theme color para browsers
- Interface responsiva

## 📄 Licença

Projeto pessoal - Todos os direitos reservados

## 👨‍💻 Desenvolvedor

Rafael Bernatat
