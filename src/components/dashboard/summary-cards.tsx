import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, ArrowDownCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  income: number | null;
  expenses: number;
  balance: number | null;
}

export function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  const summaryData = [
    {
      title: 'Monthly Income',
      value: formatCurrency(income),
      icon: Landmark,
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(expenses),
      icon: ArrowDownCircle,
    },
    {
      title: 'Current Balance',
      value: formatCurrency(balance),
      icon: Wallet,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
