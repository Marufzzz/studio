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
      'The predicted category of the expense. Must be one of: food, beverage, snacks, transportation, rent, utilities, shopping, entertainment, health, education, gift, given loan, taken loan, other.'
    ),
  confidence: z
    .number()
    .describe('The confidence level of the category prediction (0-1).'),
  personName: z.string().optional().describe("If the category is 'given loan' or 'taken loan', this is the name of the person involved."),
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
  prompt: `You are an expert financial advisor specializing in categorizing expenses from Bengali text.

You will categorize the expense text provided by the user into one of the following categories: food, beverage, snacks, transportation, rent, utilities, shopping, entertainment, health, education, gift, given loan, taken loan, other.

If the expense is a loan (given or taken), you MUST extract the name of the person involved and put it in the 'personName' field. For example, "রহিমকে ৫০০ টাকা ধার দিলাম" (Gave 500 taka loan to Rahim) should result in personName: "রহিম". If no person is mentioned for a loan, use "Unknown".

Expense Text (Bengali): {{{expenseText}}}

Consider common expenses in Bangladesh when categorizing. For example: 'চা' -> beverage, 'সিগারেট' -> other, 'চানাচুর' -> snacks.
Respond in English with the category, a confidence level (0-1), and the person's name if it's a loan. The category should be in English.

Output format: { "category": "<category>", "confidence": <confidence>, "personName": "<name>" }`,
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
