import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

interface Buyer {
  _id: string;
  name: string;
  phoneNumber: string;
  pricePerLiter: number;
}

interface SaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sale?: any;
  farmerId?: string;
}

/**
 * Milk Sale Form Component
 * Add new milk sales with validation and real-time calculations
 */
export const SaleForm: React.FC<SaleFormProps> = ({ open, onOpenChange, onSuccess, sale, farmerId = 'default' }) => {
  const { toast } = useToast();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    buyerId: '',
    quantity: '',
    pricePerLiter: '',
    quality: '',
    fatContent: '',
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch buyers on open
  useEffect(() => {
    if (!open) return;

    const fetchBuyers = async () => {
      try {
        setLoading(true);
        // Note: For development, using "default" as farmerId will return no buyers
        // In production, use actual farmer ObjectId
        const params = new URLSearchParams({
          isActive: 'true',
          limit: '100',
        });
        
        // Only add farmerId if it's a valid MongoDB ObjectId (production)
        if (farmerId && farmerId !== 'default') {
          params.append('farmerId', farmerId);
        }
        
        const response = await fetch(`${api.API_BASE_URL}/api/buyers?${params}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setBuyers(data.data || []);
        } else {
          console.warn('Failed to fetch buyers:', response.status);
          setBuyers([]);
        }
      } catch (error) {
        console.error('Error fetching buyers:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load buyers',
        });
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [open, farmerId]);

  // Update price when buyer changes
  const handleBuyerChange = (buyerId: string) => {
    const buyer = buyers.find((b) => b._id === buyerId);
    setFormData((prev) => ({
      ...prev,
      buyerId,
      pricePerLiter: buyer?.pricePerLiter.toString() || '',
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.buyerId) newErrors.buyerId = 'Buyer is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0)
      newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) < 0)
      newErrors.pricePerLiter = 'Price must be valid';
    if (!formData.saleDate) newErrors.saleDate = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const submitData = {
        farmerId,
        buyerId: formData.buyerId,
        quantity: parseFloat(formData.quantity),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        quality: formData.quality || '',
        fatContent: formData.fatContent ? parseFloat(formData.fatContent) : undefined,
        saleDate: new Date(formData.saleDate),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      };

      const response = await fetch(`${api.API_BASE_URL}/api/milk-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Milk sale recorded successfully',
        });
        onSuccess();
        setFormData({
          buyerId: '',
          quantity: '',
          pricePerLiter: '',
          quality: '',
          fatContent: '',
          saleDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          notes: '',
        });
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Failed to save sale',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quantity = parseFloat(formData.quantity) || 0;
  const pricePerLiter = parseFloat(formData.pricePerLiter) || 0;
  const totalPrice = (quantity * pricePerLiter).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>💰</span>
            New Milk Sale
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buyer Selection */}
          <div className="space-y-2">
            <Label htmlFor="buyer" className="text-base font-semibold">
              Select Buyer
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : buyers.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active buyers found. Add a buyer first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={formData.buyerId} onValueChange={handleBuyerChange}>
                <SelectTrigger id="buyer">
                  <SelectValue placeholder="Choose a buyer..." />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer._id} value={buyer._id}>
                      {buyer.name} - ₹{buyer.pricePerLiter}/L
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.buyerId && <p className="text-sm text-red-600">{errors.buyerId}</p>}
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-semibold">
                Quantity (Liters) *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                placeholder="10.5"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-semibold">
                Price per Liter (₹) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="30"
                value={formData.pricePerLiter}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricePerLiter: e.target.value }))}
                className={errors.pricePerLiter ? 'border-red-500' : ''}
              />
              {errors.pricePerLiter && <p className="text-sm text-red-600">{errors.pricePerLiter}</p>}
            </div>
          </div>

          {/* Total Price Display */}
          {quantity > 0 && pricePerLiter > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{totalPrice}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>
          )}

          {/* Quality Section */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quality Details (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Select value={formData.quality} onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, quality: value }))
                }>
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Graded</SelectItem>
                    <SelectItem value="A">A (Premium)</SelectItem>
                    <SelectItem value="B">B (Standard)</SelectItem>
                    <SelectItem value="C">C (Basic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Fat Content (%)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="3.5"
                  value={formData.fatContent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fatContent: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">Payment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentStatus: value }))
                }>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Sale Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, saleDate: e.target.value }))}
              className={errors.saleDate ? 'border-red-500' : ''}
            />
            {errors.saleDate && <p className="text-sm text-red-600">{errors.saleDate}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Add any notes about this sale..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || buyers.length === 0}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Sale'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleForm;
