'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getExpenseCategory } from '@/lib/actions/expense.actions';
import type { Expense, Loan } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';


const formSchema = z.object({
  expenseText: z.string().min(1, { message: 'Please enter an expense.' }),
});

const getCurrentDataKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `trackit-data-${year}-${month}`;
};

interface VoiceInputModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function VoiceInputModal({ isOpen, setIsOpen }: VoiceInputModalProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  
  const dataKey = React.useMemo(getCurrentDataKey, []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`${dataKey}-expenses`, []);
  const [loans, setLoans] = useLocalStorage<Loan[]>(`${dataKey}-loans`, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseText: '',
    },
  });

  const handleAddTransaction = async (text: string) => {
    if (!text) return;
    setIsProcessing(true);
    try {
      const amountMatch = text.match(/\d+(\.\d+)?/);
      if (!amountMatch) {
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: "Could not find an amount in the expense description.",
        });
        return;
      }
      const amount = parseFloat(amountMatch[0]);
      const description = text.replace(amountMatch[0], '').replace(/টাকা/g, '').trim();

      const result = await getExpenseCategory({ expenseText: text });
      
      const newEntry = {
        id: new Date().toISOString(),
        description: description || result.category,
        amount,
        date: new Date().toLocaleDateString('en-CA'),
      };

      if (result.category === 'given loan' || result.category === 'taken loan') {
        setLoans([...loans, { 
            id: newEntry.id, 
            name: result.personName || 'Unknown', 
            amount: newEntry.amount, 
            type: result.category === 'given loan' ? 'given' : 'taken',
            date: newEntry.date
        }]);
      } else {
        setExpenses([...expenses, { ...newEntry, category: result.category || 'other' }]);
      }

      toast({
        title: "Transaction Added",
        description: `"${text}" was categorized as ${result.category}.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error categorizing expense:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not categorize the transaction. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      form.reset();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await handleAddTransaction(values.expenseText);
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Your browser does not support voice recognition.',
      });
      return;
    }

    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
          setIsListening(true);
          toast({ title: 'Listening...', description: 'Please speak your transaction in Bengali.' });
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          form.setValue('expenseText', transcript);
          handleAddTransaction(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          toast({ variant: 'destructive', title: 'Voice Error', description: `Error: ${event.error}` });
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  React.useEffect(() => {
    // Stop listening if modal is closed
    if (!isOpen && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isOpen, isListening]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Use voice input in Bengali or type your transaction below and press Enter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4">
            <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className={cn(
                  "w-24 h-24 rounded-full border-4", 
                  isListening && !isProcessing && "text-destructive border-destructive animate-pulse"
                )}
            >
              {isProcessing ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
              <span className="sr-only">Use Voice</span>
            </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="expenseText"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder='e.g., "রাতের খাবার ৩০০ টাকা"' {...field} disabled={isProcessing} />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
