'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Mic, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getExpenseCategory } from '@/lib/actions/expense.actions';
import type { Expense, Loan } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

const formSchema = z.object({
  expenseText: z.string().min(1, { message: 'Please enter or speak an expense.' }),
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
  const recognitionRef = React.useRef<any>(null);
  
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
      const result = await getExpenseCategory({ expenseText: text });
      
      if (!result || !result.transactions || result.transactions.length === 0) {
          toast({
              variant: "destructive",
              title: "Could not parse expense",
              description: "Please try rephrasing your input.",
          });
          return;
      }

      const newExpenses: Expense[] = [];
      const newLoans: Loan[] = [];

      for (const transaction of result.transactions) {
        const newEntry = {
          id: `${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`,
          description: transaction.description,
          amount: transaction.amount,
          date: new Date().toLocaleDateString('en-CA'),
        };

        if (transaction.category === 'given loan' || transaction.category === 'taken loan') {
          newLoans.push({ 
              id: newEntry.id,
              description: newEntry.description,
              amount: newEntry.amount,
              date: newEntry.date,
              name: transaction.personName || 'Unknown', 
              type: transaction.category === 'given loan' ? 'given' : 'taken',
          });
        } else {
          newExpenses.push({ ...newEntry, category: transaction.category || 'other' });
        }
      }

      if (newExpenses.length > 0) {
        setExpenses(prev => [...prev, ...newExpenses]);
      }
      if (newLoans.length > 0) {
        setLoans(prev => [...prev, ...newLoans]);
      }

      toast({
        title: "Transactions Added",
        description: `${result.transactions.length} new transaction(s) categorized and saved.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error categorizing expense:', error);
      toast({
        variant: "destructive",
        title: "AI Analysis Error",
        description: "Could not categorize the transaction(s). Please try again.",
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Your browser does not support speech recognition.',
      });
      return;
    }

    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
          setIsListening(true);
          toast({ title: 'Mic On', description: 'Transcribing speech to text... Tap mic again to stop.' });
        };
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          form.setValue('expenseText', currentTranscript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          toast({ variant: 'destructive', title: 'Speech-to-Text Error', description: `Error: ${event.error}` });
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          // When mic stops, we have the final text in the form.
          // AI processing is triggered by the manual stop.
          const finalTranscript = form.getValues('expenseText');
          if (finalTranscript && !isProcessing) {
              handleAddTransaction(finalTranscript);
          }
        };

        recognitionRef.current = recognition;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      form.setValue('expenseText', '');
      recognitionRef.current.start();
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            {isListening 
              ? "Speech-to-Text Active: Speak now in Bengali..." 
              : isProcessing 
                ? "AI Analyzing Text..." 
                : "Tap the mic to start transcribing your expense."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center my-8 gap-4">
            <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className={cn(
                  "w-32 h-32 rounded-full border-4 transition-all duration-300", 
                  isListening && "text-destructive border-destructive scale-110 shadow-lg animate-pulse bg-destructive/5",
                  isProcessing && "opacity-50"
                )}
            >
              {isProcessing ? (
                <Loader2 className="h-14 w-14 animate-spin" />
              ) : isListening ? (
                <CheckCircle2 className="h-14 w-14" />
              ) : (
                <Mic className="h-14 w-14" />
              )}
              <span className="sr-only">Toggle Voice Input</span>
            </Button>
            {isListening && (
              <span className="text-xs font-medium text-destructive animate-pulse">STOP MIC TO PROCESS</span>
            )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expenseText"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder='e.g., "চা ২০ টাকা আর চানাচুর ৩০ টাকা"' 
                        {...field} 
                        disabled={isProcessing || isListening}
                        className="pr-10 h-12 text-lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isListening && !isProcessing && form.getValues('expenseText') && (
              <Button type="submit" className="w-full h-12">
                Analyze & Save
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
