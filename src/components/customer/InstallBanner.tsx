import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState, useEffect } from 'react';

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall, showIOSInstructions, isIOS } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('menio-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('menio-install-dismissed', Date.now().toString());
  };

  if (isInstalled || dismissed) {
    return null;
  }

  if (showIOSInstructions) {
    return (
      <div className="bg-primary/5 border-t border-primary/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Share className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            <span className="font-medium text-foreground">Install Menio</span> — Tap Share → "Add to Home Screen"
          </p>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="bg-primary/5 border-t border-primary/10 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <Download className="w-5 h-5 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">
          <span className="font-medium text-foreground">Install Menio</span> for quick access
        </p>
        <Button variant="cafe" size="sm" className="h-7 text-xs" onClick={promptInstall}>
          Install
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}