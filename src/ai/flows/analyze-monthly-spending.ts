'use server';

/**
 * @fileOverview Analyzes monthly spending against income and provides personalized insights and suggestions in Bengali.
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
  summary: z.string().describe('A summary of the user\'s financial situation, in Bengali.'),
  insights: z.array(z.string()).describe('Key insights into the user\'s spending habits, in Bengali.'),
  suggestions: z.array(z.string()).describe('Personalized suggestions for improving financial habits, in Bengali.'),
});
export type AnalyzeMonthlySpendingOutput = z.infer<typeof AnalyzeMonthlySpendingOutputSchema>;

export async function analyzeMonthlySpending(input: AnalyzeMonthlySpendingInput): Promise<AnalyzeMonthlySpendingOutput> {
  return analyzeMonthlySpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMonthlySpendingPrompt',
  input: {schema: AnalyzeMonthlySpendingInputSchema},
  output: {schema: AnalyzeMonthlySpendingOutputSchema},
  prompt: `You are a personal finance advisor from Bangladesh. Your role is to analyze financial data and provide personalized advice in Bengali. Address the user directly using 'আপনি' (you).

  Your analysis should be empathetic and encouraging.

  Here is the user's financial data for the month:
  - Monthly Income: ৳{{{monthlyIncome}}}
  - Total Expenses: ৳{{{totalExpenses}}}
  - Expense Breakdown:
  {{#each expenseBreakdown}}
    - {{key}}: ৳{{value}}
  {{/each}}
  - Loan Given: ৳{{{loanGiven}}}
  - Loan Taken: ৳{{{loanTaken}}}

  Based on this data, provide the following in a JSON object, with all text in Bengali:
  1.  A "summary" of the user's financial situation for the month.
  2.  A list of "insights" (অন্তর্দৃষ্টি) into their spending habits.
  3.  A list of actionable "suggestions" (পরামর্শ) for how they can improve their financial health.

  Your entire response must be in Bengali. Format the output as a JSON object.
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
