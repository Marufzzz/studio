import { PiggyBank } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline">Trackit Finance</h1>
        </div>
    </header>
  );
}
