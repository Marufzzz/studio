'use client';

import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Expense, Loan } from '@/lib/types';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { IncomeModal } from '@/components/dashboard/income-modal';
import { PiggyBank } from 'lucide-react';
import { CategorizedExpenses } from '@/components/dashboard/categorized-expenses';

const getCurrentDataKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `trackit-data-${year}-${month}`;
};

export default function HomePage() {
  const dataKey = React.useMemo(getCurrentDataKey, []);
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number | null>(`${dataKey}-income`, null);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`${dataKey}-expenses`, []);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`${dataKey}-loans`, []);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalLoanGiven = loans.filter(l => l.type === 'given').reduce((acc, curr) => acc + curr.amount, 0);
  const totalLoanTaken = loans.filter(l => l.type === 'taken').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = monthlyIncome ? monthlyIncome - totalExpenses : null;

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-headline">Dashboard</h1>
          </div>
      </header>
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
        <CategorizedExpenses expenses={expenses} />
      </main>
    </>
  );
}
