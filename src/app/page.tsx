'use client';

import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Expense, Loan, AnalysisResult } from '@/lib/types';
import { getExpenseCategory, getSpendingAnalysis } from '@/lib/actions/expense.actions';
import { Header } from '@/components/dashboard/header';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { IncomeModal } from '@/components/dashboard/income-modal';
import { ExpenseInputForm } from '@/components/dashboard/expense-input-form';
import { ExpensesTable } from '@/components/dashboard/expenses-table';
import { AnalysisSection } from '@/components/dashboard/analysis-section';
import { useToast } from '@/hooks/use-toast';

const getCurrentDataKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `trackit-data-${year}-${month}`;
};

const initialExpenses: Expense[] = [];
const initialLoans: Loan[] = [];

export default function DashboardPage() {
  const dataKey = React.useMemo(getCurrentDataKey, []);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number | null>(`${dataKey}-income`, null);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`${dataKey}-expenses`, initialExpenses);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`${dataKey}-loans`, initialLoans);
  const [analysis, setAnalysis] = useLocalStorage<AnalysisResult | null>(`${dataKey}-analysis`, null);
  
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { toast } = useToast();

  const handleAddExpense = async (text: string) => {
    if (!text) return;
    setIsCategorizing(true);
    try {
      const amountMatch = text.match(/\d+(\.\d+)?/);
      if (!amountMatch) {
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Could not find an amount in the expense description.",
        });
        return;
      }
      const amount = parseFloat(amountMatch[0]);
      const description = text.replace(amountMatch[0], '').replace(/টাকা/g, '').trim();

      const result = await getExpenseCategory({ expenseText: text });
      
      const newEntry = {
        id: new Date().toISOString(),
        description: description || result.category,
        amount,
        date: new Date().toLocaleDateString('en-CA'),
      };

      if (result.category === 'given loan' || result.category === 'taken loan') {
        setLoans([...loans, { ...newEntry, type: result.category }]);
      } else {
        setExpenses([...expenses, { ...newEntry, category: result.category || 'other' }]);
      }
      toast({
        title: "Expense Added",
        description: `"${text}" was categorized as ${result.category}.`,
      });
    } catch (error) {
      console.error('Error categorizing expense:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not categorize the expense. Please try again.",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!monthlyIncome) return;
    setIsAnalyzing(true);
    try {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const expenseBreakdown = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      const loanGiven = loans.filter(l => l.type === 'given').reduce((sum, l) => sum + l.amount, 0);
      const loanTaken = loans.filter(l => l.type === 'taken').reduce((sum, l) => sum + l.amount, 0);

      const result = await getSpendingAnalysis({
        monthlyIncome,
        totalExpenses,
        expenseBreakdown,
        loanGiven,
        loanTaken,
      });
      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: "Your monthly spending analysis is ready.",
      });
    } catch (error) {
      console.error('Error analyzing spending:', error);
       toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not analyze your spending. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalLoanGiven = loans.filter(l => l.type === 'given loan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalLoanTaken = loans.filter(l => l.type === 'taken loan').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = monthlyIncome ? monthlyIncome - totalExpenses : null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <IncomeModal
          isOpen={monthlyIncome === null}
          onSave={setMonthlyIncome}
        />
        <SummaryCards
          income={monthlyIncome}
          expenses={totalExpenses}
          savings={savings}
          loanGiven={totalLoanGiven}
          loanTaken={totalLoanTaken}
        />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
             <ExpenseInputForm onAddExpense={handleAddExpense} isProcessing={isCategorizing} />
          </div>
          <div className="row-start-3 lg:row-start-auto xl:col-span-1">
             <AnalysisSection 
                analysis={analysis} 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                canAnalyze={!!monthlyIncome && expenses.length > 0} 
              />
          </div>
          <div className="lg:col-span-2 xl:col-span-3 row-start-2 lg:row-start-auto">
            <ExpensesTable expenses={expenses} loans={loans} />
          </div>
        </div>
      </main>
    </div>
  );
}
