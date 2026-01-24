'use client';

import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Loan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, ArrowUpCircle, Handshake } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getCurrentDataKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `trackit-data-${year}-${month}`;
};

export default function LoansPage() {
    const dataKey = React.useMemo(getCurrentDataKey, []);
    const [loans, setLoans] = useLocalStorage<Loan[]>(`${dataKey}-loans`, []);
    
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const loansGiven = loans.filter(l => l.type === 'given');
    const loansTaken = loans.filter(l => l.type === 'taken');

    const totalLoanGiven = loansGiven.reduce((acc, curr) => acc + curr.amount, 0);
    const totalLoanTaken = loansTaken.reduce((acc, curr) => acc + curr.amount, 0);

    if (!isMounted) {
        return null;
    }

  return (
    <>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-headline">Loans</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loan Given</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalLoanGiven)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loan Taken</CardTitle>
                        <Handshake className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalLoanTaken)}</div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Loan Details</CardTitle>
                    <CardDescription>All your loan transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="given">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="given">Given</TabsTrigger>
                            <TabsTrigger value="taken">Taken</TabsTrigger>
                        </TabsList>
                        <TabsContent value="given">
                            <LoansTable loans={loansGiven} type="given" />
                        </TabsContent>
                        <TabsContent value="taken">
                            <LoansTable loans={loansTaken} type="taken" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    </>
  );
}

function LoansTable({ loans, type }: { loans: Loan[], type: 'given' | 'taken'}) {
    if (loans.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No loans {type} yet.</div>
    }
    return (
        <div className="overflow-auto rounded-md border" style={{maxHeight: '400px'}}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{type === 'given' ? 'To' : 'From'}</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.map((loan) => (
                        <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                            <TableCell>{new Date(loan.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
