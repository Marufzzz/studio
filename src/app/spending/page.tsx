'use client';
import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Expense } from '@/lib/types';
import { List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/dashboard/category-icon';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getMonthKeys = () => {
    if (typeof window === 'undefined') return [];
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trackit-data-') && key.endsWith('-expenses')) {
            keys.push(key.replace('-expenses', ''));
        }
    }
    // Sort by year and month descending
    return keys.sort((a, b) => b.localeCompare(a));
}

const formatDataKey = (key: string) => {
    const [, , year, month] = key.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function SpendingPage() {
    const [monthKeys, setMonthKeys] = React.useState<string[]>([]);
    const [selectedMonthKey, setSelectedMonthKey] = React.useState<string>('');

    const [expenses] = useLocalStorage<Expense[]>(`${selectedMonthKey}-expenses`, []);

    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
        const keys = getMonthKeys();
        setMonthKeys(keys);
        if (keys.length > 0) {
            setSelectedMonthKey(keys[0]);
        }
    }, []);
    
    if (!isMounted) {
        return null;
    }

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
        <>
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <List className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold font-headline">Spending History</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Breakdown</CardTitle>
                        <div className='flex justify-between items-center'>
                            <CardDescription>Your spending history by month.</CardDescription>
                            <Select value={selectedMonthKey} onValueChange={setSelectedMonthKey}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthKeys.map(key => (
                                        <SelectItem key={key} value={key}>{formatDataKey(key)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {sortedCategories.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8">No expenses for this month.</div>
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
                                            <div>
                                                <p>{item.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                                            </div>
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
            </main>
        </>
    );
}
