'use server';

import { analyzeMonthlySpending } from '@/ai/flows/analyze-monthly-spending';
import type { AnalyzeMonthlySpendingInput, AnalyzeMonthlySpendingOutput } from '@/ai/flows/analyze-monthly-spending';
import { categorizeBengaliExpenses } from '@/ai/flows/categorize-bengali-expenses';
import type { CategorizeBengaliExpensesInput, CategorizeBengaliExpensesOutput } from '@/ai/flows/categorize-bengali-expenses';

export async function getExpenseCategory(input: CategorizeBengaliExpensesInput): Promise<CategorizeBengaliExpensesOutput> {
  return await categorizeBengaliExpenses(input);
}

export async function getSpendingAnalysis(input: AnalyzeMonthlySpendingInput): Promise<AnalyzeMonthlySpendingOutput> {
  return await analyzeMonthlySpending(input);
}
