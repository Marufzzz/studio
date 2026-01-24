export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Loan {
  id: string;
  description: string;
  amount: number;
  type: 'given loan' | 'taken loan';
  date: string;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  suggestions: string[];
}
