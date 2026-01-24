import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, ArrowUpCircle, ArrowDownCircle, Wallet, Handshake } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  income: number | null;
  expenses: number;
  savings: number | null;
  loanGiven: number;
  loanTaken: number;
}

export function SummaryCards({ income, expenses, savings, loanGiven, loanTaken }: SummaryCardsProps) {
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
      title: 'Savings',
      value: formatCurrency(savings),
      icon: Wallet,
    },
    {
      title: 'Loan Given',
      value: formatCurrency(loanGiven),
      icon: ArrowUpCircle,
    },
    {
      title: 'Loan Taken',
      value: formatCurrency(loanTaken),
      icon: Handshake,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
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
