'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mic, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  expenseText: z.string().min(1, { message: 'Please enter an expense.' }),
});

interface ExpenseInputFormProps {
  onAddExpense: (text: string) => Promise<void>;
  isProcessing: boolean;
}

export function ExpenseInputForm({ onAddExpense, isProcessing }: ExpenseInputFormProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseText: '',
    },
  });

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
          toast({ title: 'Listening...', description: 'Please speak your expense in Bengali.' });
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          form.setValue('expenseText', transcript);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddExpense(values.expenseText);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>
          Enter your expense in Bengali (e.g., "চা বিস্কুট ২০ টাকা") or use voice input.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="expenseText"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input placeholder='e.g., " রাতের খাবার ৩০০ টাকা"' {...field} />
                       <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleVoiceInput}
                        className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8", isListening && "text-destructive")}
                      >
                        <Mic className="h-4 w-4" />
                        <span className="sr-only">Use Voice</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
