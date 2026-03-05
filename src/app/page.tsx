'use client';

import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Expense } from '@/lib/types';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { IncomeModal } from '@/components/dashboard/income-modal';
import { CategorizedExpenses } from '@/components/dashboard/categorized-expenses';
import Image from 'next/image';

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

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const savings = monthlyIncome ? monthlyIncome - totalExpenses : null;

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="techa logo" 
                width={32} 
                height={32} 
                className="rounded-full"
              />
              <h1 className="text-xl font-bold font-headline">techa Dashboard</h1>
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
          balance={savings}
        />
        <CategorizedExpenses expenses={expenses} />
      </main>
    </>
  );
}
