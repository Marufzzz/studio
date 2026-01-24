export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Loan {
  id:string;
  name: string;
  amount: number;
  type: 'given' | 'taken';
  date: string;
  description: string;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  suggestions: string[];
}
