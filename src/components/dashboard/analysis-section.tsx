'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, Sparkles, Target } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface AnalysisSectionProps {
  analysis: AnalysisResult | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

export function AnalysisSection({ analysis, onAnalyze, isAnalyzing, canAnalyze }: AnalysisSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>
          Get personalized insights and suggestions on your spending.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Summary</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="insights">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Insights
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {analysis.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="suggestions">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Next Steps
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {analysis.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button onClick={onAnalyze} disabled={isAnalyzing || !canAnalyze} className="w-full">
                Re-analyze Spending
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">Click the button to analyze your monthly spending.</p>
            <Button onClick={onAnalyze} disabled={isAnalyzing || !canAnalyze}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze My Spending'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
