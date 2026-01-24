'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, List, Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceInputModal } from '../voice-input-modal';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/spending', label: 'Spending', icon: List },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/analysis', label: 'Analysis', icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-card border-t">
        <div className="grid h-full grid-cols-5 max-w-lg mx-auto font-medium">
          {navItems.slice(0, 2).map(({ href, label, icon: Icon }) => {
             const isActive = pathname === href;
             return (
                <Link key={label} href={href} className={cn("inline-flex flex-col items-center justify-center px-5 hover:bg-muted", isActive ? "text-primary" : "text-muted-foreground")}>
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{label}</span>
                </Link>
             )
          })}
         
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center w-16 h-16 font-medium bg-primary text-primary-foreground rounded-full -mt-8 border-4 border-background shadow-lg hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/50"
            >
              <Mic className="w-8 h-8" />
              <span className="sr-only">Add Transaction</span>
            </button>
          </div>

          {navItems.slice(2, 4).map(({ href, label, icon: Icon }) => {
             const isActive = pathname === href;
             return (
                <Link key={label} href={href} className={cn("inline-flex flex-col items-center justify-center px-5 hover:bg-muted", isActive ? "text-primary" : "text-muted-foreground")}>
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{label}</span>
                </Link>
             )
          })}
        </div>
      </div>
      <VoiceInputModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
}
