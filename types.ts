import { 
  Utensils, Car, Home, HeartPulse, 
  PartyPopper, GraduationCap, Wallet, 
  TrendingUp, CircleDollarSign, LucideIcon 
} from 'lucide-react';

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  CALENDAR = 'CALENDAR',
  ADVISOR = 'ADVISOR'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum ExpenseType {
  FIXED = 'FIXED',       // Aluguel, Internet, Assinaturas
  SPORADIC = 'SPORADIC'  // Jantar fora, Uber, Compras
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  expenseType?: ExpenseType; // New field
  category: string;
  date: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
  'Lazer', 'Educação', 'Salário', 'Investimentos', 'Outros'
];

// Configuration for Icons and Colors
interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Alimentação': { icon: Utensils, color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
  'Transporte': { icon: Car, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  'Moradia': { icon: Home, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  'Saúde': { icon: HeartPulse, color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
  'Lazer': { icon: PartyPopper, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  'Educação': { icon: GraduationCap, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  'Salário': { icon: Wallet, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
  'Investimentos': { icon: TrendingUp, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
  'Outros': { icon: CircleDollarSign, color: 'text-slate-400', bgColor: 'bg-slate-400/10' },
};