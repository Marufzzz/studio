import Image from 'next/image';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="techa logo" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            <h1 className="text-xl font-bold font-headline">techa</h1>
        </div>
    </header>
  );
}
