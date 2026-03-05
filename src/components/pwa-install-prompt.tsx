'use client';

import * as React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if the app is already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <Alert className="bg-primary text-primary-foreground border-none shadow-2xl">
        <Download className="h-4 w-4 text-primary-foreground" />
        <AlertTitle className="font-bold">Install techa</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 mt-1">
          <p className="text-xs opacity-90">Install techa on your home screen for a faster, full-screen experience.</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleInstallClick}
              className="font-bold h-8 px-4"
            >
              Install Now
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsVisible(false)}
              className="text-primary-foreground hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
