import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface MilkQuantityDialogProps {
  open: boolean;
  onSubmit: (quantity: number) => void;
  onCancel: () => void;
  duration: number;
  isLoading?: boolean;
}

export function MilkQuantityDialog({ open, onSubmit, onCancel, duration, isLoading }: MilkQuantityDialogProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseFloat(quantity);
    
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    
    onSubmit(numQuantity);
    setQuantity('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg sm:text-xl">{t.enterMilkQuantity} 🐄</DialogTitle>
          <DialogDescription className="text-sm">
            {t.howMuchMilk} {t.sessionDuration}: <strong>{formatDuration(duration)}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-3 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm">{t.milk} (L)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                placeholder={t.milkQuantityPlaceholder}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                autoFocus
                className="h-11 text-base"
              />
              {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? t.saving : t.saveSession}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
