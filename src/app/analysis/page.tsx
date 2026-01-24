'use client';

import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Expense, Loan, AnalysisResult } from '@/lib/types';
import { getSpendingAnalysis } from '@/lib/actions/expense.actions';
import { AnalysisSection } from '@/components/dashboard/analysis-section';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const getCurrentDataKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `trackit-data-${year}-${month}`;
};

export default function AnalysisPage() {
  const dataKey = React.useMemo(getCurrentDataKey, []);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number | null>(`${dataKey}-income`, null);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`${dataKey}-expenses`, []);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`${dataKey}-loans`, []);
  const [analysis, setAnalysis] = useLocalStorage<AnalysisResult | null>(`${dataKey}-analysis`, null);
  
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) {
    return null;
  }
  
  return (
    <>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-headline">AI Analysis</h1>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {monthlyIncome === null ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Set Your Income</CardTitle>
                        <CardDescription>You need to set your monthly income on the homepage before we can analyze your spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm text-muted-foreground'>Go to the Home page to set your income.</p>
                    </CardContent>
                </Card>
            ) : (
                <AnalysisSection 
                    analysis={analysis} 
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                    canAnalyze={!!monthlyIncome && expenses.length > 0} 
                />
            )}
        </main>
    </>
  );
}
