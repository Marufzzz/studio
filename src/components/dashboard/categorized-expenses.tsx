'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from './category-icon';
import { Progress } from '../ui/progress';

interface CategorizedExpensesProps {
  expenses: Expense[];
}

export function CategorizedExpenses({ expenses }: CategorizedExpensesProps) {
  const categorized = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) {
      acc[category] = { total: 0, items: [] };
    }
    acc[category].total += amount;
    acc[category].items.push(expense);
    return acc;
  }, {} as Record<string, { total: number; items: Expense[] }>);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const sortedCategories = Object.entries(categorized).sort(([, a], [, b]) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Your spending by category for the current month.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedCategories.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">No expenses recorded yet.</div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sortedCategories.map(([category, { total, items }]) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger>
                  <div className="flex items-center w-full gap-4">
                    <CategoryIcon category={category} className="h-5 w-5" />
                    <div className='flex-1 text-left'>
                      <div className="flex justify-between">
                        <span className="font-semibold capitalize">{category}</span>
                        <span className="font-semibold">{formatCurrency(total)}</span>
                      </div>
                      <Progress value={(total / totalExpenses) * 100} className="h-2 mt-1" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 mt-2">
                    {items.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm ml-8">
                        <span>{item.description}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
