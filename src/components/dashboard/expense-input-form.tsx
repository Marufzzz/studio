'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Mic } from 'lucide-react';
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onAddExpense(values.expenseText);
    form.reset();
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
          toast({ title: 'Listening...', description: 'Please speak your expense in Bengali.' });
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          form.setValue('expenseText', transcript);
          onSubmit({ expenseText: transcript });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>
          Use voice input or enter your expense below and press Enter (e.g., "চা বিস্কুট ২০ টাকা").
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
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
                    <Input placeholder='e.g., " রাতের খাবার ৩০০ টাকা"' {...field} disabled={isProcessing} />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
