import { AppData, RSVPStatus } from './types';

export const DEFAULT_DATA: AppData = {
  details: {
    title: "Aniversário do Ben",
    date: "2026-06-30",
    theme: "Ben e os Dinossauros",
    totalBudget: 5000,
  },
  categories: [
    {
      id: 'cat-1',
      name: 'Alimentação',
      tasks: [
        { id: 't-1', description: 'Bolo', budgeted: 300, spent: 0, completed: false },
        { id: 't-2', description: 'Salgadinhos', budgeted: 800, spent: 0, completed: false },
        { id: 't-3', description: 'Bebidas', budgeted: 400, spent: 0, completed: false },
      ]
    },
    {
      id: 'cat-2',
      name: 'Decoração',
      tasks: [
        { id: 't-4', description: 'Balões', budgeted: 200, spent: 150, completed: true },
        { id: 't-5', description: 'Mesa Principal', budgeted: 600, spent: 0, completed: false },
      ]
    },
    {
      id: 'cat-3',
      name: 'Local',
      tasks: [
        { id: 't-6', description: 'Aluguel do Salão', budgeted: 1000, spent: 1000, completed: true },
      ]
    }
  ],
  guests: [
    { id: 'g-1', name: 'Vovó Maria', adults: 1, kids: 0, status: RSVPStatus.CONFIRMED },
    { id: 'g-2', name: 'Tio João e Família', adults: 2, kids: 2, status: RSVPStatus.PENDING },
  ],
  vendorServices: [
    {
      id: 'vs-1',
      name: 'Buffet',
      selectedOptionId: 'vo-1',
      options: [
        {
          id: 'vo-1',
          name: 'Buffet Delícia',
          contact: '(11) 99999-9999',
          quote: 2500,
          rating: 5,
          notes: 'Inclui bolo e doces. Garçons inclusos.'
        },
        {
          id: 'vo-2',
          name: 'Salgados da Tia',
          contact: '(11) 98888-8888',
          quote: 1800,
          rating: 3,
          notes: 'Preço bom, mas não tem garçom. Precisa contratar à parte.'
        }
      ]
    },
    {
      id: 'vs-2',
      name: 'Fotografia',
      selectedOptionId: undefined, // Nenhum selecionado ainda
      options: [
        {
          id: 'vo-3',
          name: 'Foto Kids',
          contact: '@fotokids',
          quote: 800,
          rating: 4,
          notes: 'Álbum digital incluso.'
        }
      ]
    }
  ]
};

export const STORAGE_KEY = 'eventPlannerData_v2'; // Bumped version due to schema change