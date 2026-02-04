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

const MAX_MILK_QUANTITY = 100; // Maximum reasonable milk quantity in liters

export function MilkQuantityDialog({ open, onSubmit, onCancel, duration, isLoading }: MilkQuantityDialogProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const validateQuantity = (value: string): string => {
    if (!value.trim()) {
      return 'Milk quantity is required';
    }
    
    const numQuantity = parseFloat(value);
    
    if (isNaN(numQuantity)) {
      return 'Please enter a valid number';
    }
    
    if (numQuantity <= 0) {
      return 'Quantity must be greater than 0 liters';
    }
    
    if (numQuantity > MAX_MILK_QUANTITY) {
      return `Quantity cannot exceed ${MAX_MILK_QUANTITY} liters`;
    }
    
    return '';
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);
    if (touched) {
      setError(validateQuantity(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleOpenChange(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isQuantityValid) {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    const validationError = validateQuantity(quantity);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSubmit(parseFloat(quantity));
    setQuantity('');
    setError('');
    setTouched(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel();
      setQuantity('');
      setError('');
      setTouched(false);
    }
  };

  const isQuantityValid = !error && quantity.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-lg mx-auto" role="dialog" aria-labelledby="milk-dialog-title" aria-describedby="milk-dialog-description">
        <DialogHeader>
          <DialogTitle id="milk-dialog-title" className="text-primary text-lg sm:text-xl">{t.enterMilkQuantity} 🐄</DialogTitle>
          <DialogDescription id="milk-dialog-description" className="text-sm">
            {t.howMuchMilk} {t.sessionDuration}: <strong>{formatDuration(duration)}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 py-3 sm:py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quantity" className="text-sm">
                  {t.milk} (L) <span className="text-destructive" aria-label="required">*</span>
                </Label>
                {touched && isQuantityValid && <span className="text-xs text-green-600 font-semibold">✓</span>}
              </div>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                max={MAX_MILK_QUANTITY}
                placeholder={t.milkQuantityPlaceholder}
                value={quantity}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTouched(true)}
                autoFocus
                aria-required="true"
                aria-invalid={touched && !!error}
                aria-describedby={error ? 'quantity-error' : undefined}
                className={`h-11 text-base transition-colors ${
                  touched && error ? 'border-destructive focus:border-destructive' : ''
                } ${
                  touched && isQuantityValid ? 'border-green-500' : ''
                }`}
              />
              {error && <p id="quantity-error" className="text-xs sm:text-sm text-destructive font-medium">{error}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
              aria-label="Cancel adding milk quantity"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !isQuantityValid} 
              className="w-full sm:w-auto"
              aria-label="Save milking session"
            >
              {isLoading ? t.saving : t.saveSession}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
