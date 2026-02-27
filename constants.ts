import { AppData, RSVPStatus, TaskStatus } from "./types";

export const DEFAULT_DATA: AppData = {
  details: {
    title: "Aniversário do Ben",
    date: "2026-06-30",
    theme: "Ben e os Dinossauros",
    totalBudget: 5000,
  },
  categories: [
    {
      id: "cat-1",
      name: "Alimentação",
      tasks: [
        {
          id: "t-1",
          description: "Bolo",
          status: TaskStatus.TODO,
        },
        {
          id: "t-2",
          description: "Salgadinhos",
          status: TaskStatus.TODO,
        },
        {
          id: "t-3",
          description: "Bebidas",
          status: TaskStatus.TODO,
        },
      ],
    },
    {
      id: "cat-2",
      name: "Decoração",
      tasks: [
        {
          id: "t-4",
          description: "Balões",
          status: TaskStatus.COMPLETED,
        },
        {
          id: "t-5",
          description: "Mesa Principal",
          status: TaskStatus.TODO,
        },
      ],
    },
    {
      id: "cat-3",
      name: "Local",
      tasks: [
        {
          id: "t-6",
          description: "Aluguel do Salão",
          status: TaskStatus.COMPLETED,
        },
      ],
    },
  ],
  guests: [
    {
      id: "g-1",
      name: "Vovó Maria",
      adults: 1,
      kids: 0,
      status: RSVPStatus.CONFIRMED,
    },
    {
      id: "g-2",
      name: "Tio João e Família",
      adults: 2,
      kids: 2,
      status: RSVPStatus.PENDING,
    },
  ],
  vendorServices: [
    {
      id: "vs-1",
      name: "Buffet",
      selectedOptionId: "vo-1",
      chosenOptionId: "vo-1",
      options: [
        {
          id: "vo-1",
          name: "Buffet Delícia",
          contact: "(11) 99999-9999",
          quote: 2500,
          rating: 5,
          notes: "Inclui bolo e doces. Garçons inclusos.",
          paymentTerms: "30% sinal + 3x no cartão",
          paymentDate: "2026-04-05",
          paymentPlan: [
            {
              id: "vop-1",
              date: "2026-04-05",
              amount: 750,
              description: "Sinal",
            },
            {
              id: "vop-2",
              date: "2026-05-05",
              amount: 875,
              description: "Parcela 1/2",
            },
            {
              id: "vop-3",
              date: "2026-06-05",
              amount: 875,
              description: "Parcela 2/2",
            },
          ],
        },
        {
          id: "vo-2",
          name: "Salgados da Tia",
          contact: "(11) 98888-8888",
          quote: 1800,
          rating: 3,
          notes: "Preço bom, mas não tem garçom. Precisa contratar à parte.",
        },
      ],
    },
  ],
};

export const STORAGE_KEY = "eventPlannerData_v2";
