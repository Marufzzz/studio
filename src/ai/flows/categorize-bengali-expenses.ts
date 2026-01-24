'use server';
/**
 * @fileOverview This file defines a Genkit flow for categorizing one or more Bengali expense inputs from a single text string.
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
    .describe('A single string containing one or more expense descriptions in Bengali.'),
});
export type CategorizeBengaliExpensesInput = z.infer<typeof CategorizeBengaliExpensesInputSchema>;

const ExpenseTransactionSchema = z.object({
    description: z.string().describe("The description of the expense item (e.g., 'চা বিস্কুট')."),
    amount: z.number().describe("The amount of the expense item (e.g., 20)."),
    category: z
        .string()
        .describe(
        'The predicted category of the expense. Must be one of: food, beverage, snacks, transportation, rent, utilities, shopping, entertainment, health, education, gift, given loan, taken loan, other.'
        ),
    personName: z.string().optional().describe("If the category is 'given loan' or 'taken loan', this is the name of the person involved."),
});

const CategorizeBengaliExpensesOutputSchema = z.object({
    transactions: z.array(ExpenseTransactionSchema).describe("An array of parsed expense transactions.")
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
  prompt: `You are an expert financial advisor specializing in parsing and categorizing expenses from a single string of Bengali text which may contain one or more transactions.

Your task is to identify each individual transaction from the user's input, extract its description, amount, and categorize it.

You must categorize each expense into one of the following categories: food, beverage, snacks, transportation, rent, utilities, shopping, entertainment, health, education, gift, given loan, taken loan, other.

If an expense is a loan (given or taken), you MUST extract the name of the person involved and put it in the 'personName' field. For example, "রহিমকে ৫০০ টাকা ধার দিলাম" (Gave 500 taka loan to Rahim) should result in personName: "রহিম". If no person is mentioned for a loan, use "Unknown".

The user might use connectors like 'আর', 'এবং', or just list them. For example: "ভাত ৬০ টাকা আর রিকশা ভাড়া ৩০ টাকা". This should be parsed into two separate transactions.
A single transaction like " রাতের খাবার ৩০০ টাকা" should be parsed as one transaction.

Another example with multiple items: "নাস্তা ২০ টাকা, সিগারেট ৩০". This should also be parsed as two transactions.

Expense Text (Bengali): {{{expenseText}}}

Consider common expenses in Bangladesh when categorizing. For example: 'চা' -> beverage, 'সিগারেট' -> other, 'চানাচুর' -> snacks.
Respond with a JSON object containing an array of transaction objects. Each object must have a 'description', 'amount', 'category', and optionally a 'personName'. The category should be in English.
If the input string is empty or does not seem to contain any valid expense, return an empty array for transactions.
`,
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
