import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateInvoice } from '@/lib/invoiceService';

interface MilkSale {
  _id: string;
  farmerId: string;
  buyerId: string;
  quantity: number;
  pricePerLiter: number;
  totalPrice: number;
  date: string;
  paymentStatus: string;
  quality: string;
  invoiceNumber?: string;
  notes?: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerAddress?: string;
  tax?: number;
}

interface Buyer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface InvoicePreviewProps {
  sale: MilkSale | null;
  buyer: Buyer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  sale,
  buyer,
  open,
  onOpenChange,
}) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateInvoice = async () => {
    if (!sale) return;

    setIsGenerating(true);
    try {
      await generateInvoice(
        {
          invoiceNumber: sale.invoiceNumber || `INV-${sale._id.substring(0, 8)}`,
          farmerId: sale.farmerId,
          farmerName: sale.farmerName || 'Farmer',
          farmerPhone: sale.farmerPhone || '',
          farmerAddress: sale.farmerAddress || '',
          buyerId: sale.buyerId,
          buyerName: buyer?.name || 'Unknown Buyer',
          buyerPhone: buyer?.phone || '',
          buyerAddress: buyer?.address || '',
          saleDate: new Date(sale.date),
          quantity: sale.quantity,
          pricePerLiter: sale.pricePerLiter,
          totalPrice: sale.totalPrice,
          quality: sale.quality,
          paymentStatus: (sale.paymentStatus as 'paid' | 'pending' | 'partial') || 'pending',
          paymentMethod: 'direct',
          language: language as 'en' | 'hi' | 'pa',
        }
      );
      toast({
        title: language === 'en' ? 'Invoice Generated' : language === 'hi' ? 'इनवॉइस जेनरेट किया गया' : 'ਇਨਵਾਇਸ ਜੇਨਰੇਟ ਕੀਤਾ ਗਿਆ',
        description: language === 'en' ? 'Invoice has been downloaded.' : language === 'hi' ? 'इनवॉइस डाउनलोड किया जा चुका है।' : 'ਇਨਵਾਇਸ ਡਾਊਨਲੋਡ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ।',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : language === 'hi' ? 'त्रुटि' : 'ਗਲਤੀ',
        description: language === 'en' ? 'Failed to generate invoice' : language === 'hi' ? 'इनवॉइस जेनरेट करने में विफल' : 'ਇਨਵਾਇਸ ਜੇਨਰੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Invoice Preview' : language === 'hi' ? 'इनवॉइस पूर्वावलोकन' : 'ਇਨਵਾਇਸ ਪ੍ਰਿਵਿਊ'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' ? 'Review the invoice details before downloading' : language === 'hi' ? 'डाउनलोड करने से पहले इनवॉइस विवरण की समीक्षा करें' : 'ਡਾਊਨਲੋਡ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇਨਵਾਇਸ ਦੇ ਵੇਰਵਿਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Invoice Header */}
          <div className="border rounded-lg p-6 bg-card space-y-4">
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'en' ? 'INVOICE' : language === 'hi' ? 'इनवॉइस' : 'ਇਨਵਾਇਸ'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? `Invoice #${sale.invoiceNumber || 'N/A'}` : language === 'hi' ? `इनवॉइस #${sale.invoiceNumber || 'N/A'}` : `ਇਨਵਾਇਸ #${sale.invoiceNumber || 'N/A'}`}
              </p>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  {language === 'en' ? 'Invoice Date' : language === 'hi' ? 'इनवॉइस तारीख' : 'ਇਨਵਾਇਸ ਤਾਰੀਖ'}
                </p>
                <p className="font-medium">{formatDate(new Date().toISOString())}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  {language === 'en' ? 'Sale Date' : language === 'hi' ? 'बिक्री तारीख' : 'ਵਿਕਰੀ ਤਾਰੀਖ'}
                </p>
                <p className="font-medium">{formatDate(sale.date)}</p>
              </div>
            </div>

            <Separator />

            {/* Buyer & Farmer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  {language === 'en' ? 'Farmer Details' : language === 'hi' ? 'किसान विवरण' : 'ਕਿਸਾਨ ਵੇਰਵੇ'}
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{sale.farmerName || 'Farmer'}</p>
                  <p className="text-muted-foreground">{sale.farmerPhone || 'N/A'}</p>
                  <p className="text-muted-foreground">{sale.farmerAddress || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  {language === 'en' ? 'Buyer Details' : language === 'hi' ? 'खरीदार विवरण' : 'ਖ਼ਰੀਦਾਰ ਵੇਰਵੇ'}
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{buyer?.name || 'Buyer'}</p>
                  <p className="text-muted-foreground">{buyer?.phone || 'N/A'}</p>
                  <p className="text-muted-foreground">{buyer?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sale Details Table */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                {language === 'en' ? 'Sale Details' : language === 'hi' ? 'बिक्री विवरण' : 'ਵਿਕਰੀ ਵੇਰਵੇ'}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{language === 'en' ? 'Item' : language === 'hi' ? 'वस्तु' : 'ਚੀਜ਼'}</th>
                    <th className="text-right py-2">{language === 'en' ? 'Qty' : language === 'hi' ? 'मात्रा' : 'ਮਾਤਰਾ'}</th>
                    <th className="text-right py-2">{language === 'en' ? 'Price' : language === 'hi' ? 'कीमत' : 'ਕੀਮਤ'}</th>
                    <th className="text-right py-2">{language === 'en' ? 'Amount' : language === 'hi' ? 'रकम' : 'ਰਕਮ'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">
                      <div>
                        <p className="font-medium">
                          {language === 'en' ? 'Fresh Milk' : language === 'hi' ? 'ताजा दूध' : 'ਤਾਜ਼ਾ ਦੂਧ'}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {language === 'en' ? `Grade ${sale.quality}` : language === 'hi' ? `ग्रेड ${sale.quality}` : `ਗ੍ਰੇਡ ${sale.quality}`}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right py-2">{sale.quantity} L</td>
                    <td className="text-right py-2">{formatCurrency(sale.pricePerLiter, 'INR')}</td>
                    <td className="text-right py-2 font-medium">
                      {formatCurrency(sale.totalPrice, 'INR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Subtotal' : language === 'hi' ? 'उप-कुल' : 'ਸਬ-ਕੁਲ'}
                  </span>
                  <span>{formatCurrency(sale.totalPrice, 'INR')}</span>
                </div>
                {sale.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Tax (GST)' : language === 'hi' ? 'कर (जीएसटी)' : 'ਟੈਕਸ (GST)'}
                    </span>
                    <span>{formatCurrency(sale.tax, 'INR')}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>
                    {language === 'en' ? 'Total Amount' : language === 'hi' ? 'कुल राशि' : 'ਕੁਲ ਰਾਸ਼ਿ'}
                  </span>
                  <span>{formatCurrency((sale.tax || 0) + sale.totalPrice, 'INR')}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {sale.paymentStatus && (
              <div className="pt-4">
                <Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {language === 'en' ? `Status: ${sale.paymentStatus}` : language === 'hi' ? (sale.paymentStatus === 'paid' ? 'स्थिति: भुगतान किया गया' : 'स्थिति: लंबित') : (sale.paymentStatus === 'paid' ? 'ਸਥਿਤੀ: ਭੁਗਤਾਨ ਕੀਤਾ ਗਿਆ' : 'ਸਥਿਤੀ: ਮੁਲਤਵੀ')}
                </Badge>
              </div>
            )}
          </div>
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'ਬੰਦ ਕਰੋ'}
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>Loading...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {language === 'en' ? 'Download Invoice' : language === 'hi' ? 'इनवॉइस डाउनलोड करें' : 'ਇਨਵਾਇਸ ਡਾਊਨਲੋਡ ਕਰੋ'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
