'use server';
/**
 * @fileOverview This file defines a Genkit flow for categorizing Bengali expense inputs into predefined categories.
 *
 * - categorizeBengaliExpenses - A function that handles the categorization of Bengali expenses.
 * - CategorizeBengaliExpensesInput - The input type for the categorizeBengaliExpenses function.
 * - CategorizeBengaliExpensesOutput - The return type for the categorizeBengaliExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeBengaliExpensesInputSchema = z.object({
  expenseText: z
    .string()
    .describe('The expense text entered by the user in Bengali.'),
});
export type CategorizeBengaliExpensesInput = z.infer<typeof CategorizeBengaliExpensesInputSchema>;

const CategorizeBengaliExpensesOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The predicted category of the expense, e.g., food, transportation, rent, given loan, taken loan, etc.'
    ),
  confidence: z
    .number()
    .describe('The confidence level of the category prediction (0-1).'),
});
export type CategorizeBengaliExpensesOutput = z.infer<typeof CategorizeBengaliExpensesOutputSchema>;

export async function categorizeBengaliExpenses(
  input: CategorizeBengaliExpensesInput
): Promise<CategorizeBengaliExpensesOutput> {
  return categorizeBengaliExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeBengaliExpensesPrompt',
  input: {schema: CategorizeBengaliExpensesInputSchema},
  output: {schema: CategorizeBengaliExpensesOutputSchema},
  prompt: `You are an expert financial advisor specializing in categorizing expenses.

You will categorize the expense text provided by the user into one of the following categories: food, transportation, rent, given loan, taken loan, other.

Expense Text (Bengali): {{{expenseText}}}

Consider common expenses in Bangladesh when categorizing. Respond in English with the category and a confidence level (0-1). The category should be in English.

Output format: { \"category\": \"<category>\", \"confidence\": <confidence> }`,
});

const categorizeBengaliExpensesFlow = ai.defineFlow(
  {
    name: 'categorizeBengaliExpensesFlow',
    inputSchema: CategorizeBengaliExpensesInputSchema,
    outputSchema: CategorizeBengaliExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
