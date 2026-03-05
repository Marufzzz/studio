'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: 'Please enter a valid income.' }),
});

interface IncomeModalProps {
  isOpen: boolean;
  onSave: (income: number) => void;
}

export function IncomeModal({ isOpen, onSave }: IncomeModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values.income);
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="flex flex-col items-center text-center">
              <Image 
                src="/logo.png" 
                alt="techa logo" 
                width={64} 
                height={64} 
                className="mb-4 rounded-full"
              />
              <DialogTitle>Welcome to techa</DialogTitle>
              <DialogDescription>
                To get started, please enter your total monthly income in BDT.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income (BDT)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Save and Continue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
