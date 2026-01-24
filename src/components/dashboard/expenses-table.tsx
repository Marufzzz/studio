import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Expense, Loan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from './category-icon';
import { Badge } from '@/components/ui/badge';

interface ExpensesTableProps {
  expenses: Expense[];
  loans: Loan[];
}

export function ExpensesTable({ expenses, loans }: ExpensesTableProps) {
    const allTransactions = [...expenses, ...loans].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your recent expenses and loans.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TransactionTable transactions={allTransactions} />
          </TabsContent>
          <TabsContent value="expenses">
            <TransactionTable transactions={expenses} />
          </TabsContent>
          <TabsContent value="loans">
            <TransactionTable transactions={loans} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TransactionTable({ transactions }: { transactions: (Expense | Loan)[] }) {
    if (transactions.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No transactions yet.</div>
    }
  return (
    <div className="overflow-auto rounded-md border" style={{maxHeight: '400px'}}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell>
                 <Badge variant="outline" className="flex items-center gap-2 w-fit">
                    <CategoryIcon category={'category' in item ? item.category : item.type} />
                    {'category' in item ? item.category : item.type}
                 </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
