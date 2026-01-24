'use server';

/**
 * @fileOverview Analyzes monthly spending against income and provides personalized insights and suggestions.
 *
 * - analyzeMonthlySpending - A function that analyzes the monthly spending.
 * - AnalyzeMonthlySpendingInput - The input type for the analyzeMonthlySpending function.
 * - AnalyzeMonthlySpendingOutput - The return type for the analyzeMonthlySpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMonthlySpendingInputSchema = z.object({
  monthlyIncome: z.number().describe('The user\'s total monthly income in BDT.'),
  totalExpenses: z.number().describe('The user\'s total monthly expenses in BDT.'),
  expenseBreakdown: z.record(z.string(), z.number()).describe('A breakdown of expenses by category (e.g., food, transportation).  Keys are expense categories, values are the amount spent in BDT.'),
  loanGiven: z.number().describe('Total amount of money given as loan'),
  loanTaken: z.number().describe('Total amount of money taken as loan')
});
export type AnalyzeMonthlySpendingInput = z.infer<typeof AnalyzeMonthlySpendingInputSchema>;

const AnalyzeMonthlySpendingOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s financial situation.'),
  insights: z.array(z.string()).describe('Key insights into the user\'s spending habits.'),
  suggestions: z.array(z.string()).describe('Personalized suggestions for improving financial habits.'),
});
export type AnalyzeMonthlySpendingOutput = z.infer<typeof AnalyzeMonthlySpendingOutputSchema>;

export async function analyzeMonthlySpending(input: AnalyzeMonthlySpendingInput): Promise<AnalyzeMonthlySpendingOutput> {
  return analyzeMonthlySpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMonthlySpendingPrompt',
  input: {schema: AnalyzeMonthlySpendingInputSchema},
  output: {schema: AnalyzeMonthlySpendingOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's monthly spending and provide insights and suggestions.

  Monthly Income: BDT {{{monthlyIncome}}}
  Total Expenses: BDT {{{totalExpenses}}}
  Expense Breakdown:
  {{#each expenseBreakdown}}
  - {{key}}: BDT {{value}}
  {{/each}}
  Loan Given: BDT {{{loanGiven}}}
  Loan Taken: BDT {{{loanTaken}}}

  Provide a summary of their financial situation, key insights into their spending habits, and personalized suggestions for improvement.  Format the output as a JSON object.
  `,
});

const analyzeMonthlySpendingFlow = ai.defineFlow(
  {
    name: 'analyzeMonthlySpendingFlow',
    inputSchema: AnalyzeMonthlySpendingInputSchema,
    outputSchema: AnalyzeMonthlySpendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
