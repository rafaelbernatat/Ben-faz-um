export enum RSVPStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  DECLINED = 'Recusado'
}

export interface Guest {
  id: string;
  name: string;
  adults: number;
  kids: number;
  status: RSVPStatus;
  contact?: string;
}

export interface Task {
  id: string;
  description: string;
  budgeted: number;
  spent: number;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  tasks: Task[];
}

// Nova estrutura para Concorrência de Fornecedores
export interface VendorOption {
  id: string;
  name: string;
  contact: string;
  notes?: string;
  quote: number; // Valor orçado
  rating: number; // 0 a 5
}

export interface VendorService {
  id: string;
  name: string; // Ex: Buffet, Fotografia
  selectedOptionId?: string; // ID do fornecedor escolhido
  options: VendorOption[];
}

export interface EventDetails {
  title: string;
  date: string; // YYYY-MM-DD
  theme: string;
  totalBudget: number;
}

export interface AppData {
  details: EventDetails;
  categories: Category[];
  guests: Guest[];
  vendorServices: VendorService[]; // Renomeado de vendors para vendorServices
}

export type ViewState = 'dashboard' | 'budget' | 'guests' | 'vendors' | 'settings';