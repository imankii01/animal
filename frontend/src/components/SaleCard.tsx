import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Download, Eye, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateInvoice } from '@/lib/invoiceService';
import * as api from '@/lib/api';

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

interface SaleCardProps {
  sale: MilkSale;
  onEdit: (sale: MilkSale) => void;
  onDelete: (saleId: string) => void;
  onRefresh: () => void;
}

const qualityBadgeVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  A: 'default',
  B: 'secondary',
  C: 'destructive',
};

export const SaleCard: React.FC<SaleCardProps> = ({ sale, onEdit, onDelete, onRefresh }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [buyer, setBuyer] = React.useState<Buyer | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBuyer = async () => {
      try {
        if (sale.buyerId) {
          const response = await api.get(`/api/buyers/${sale.buyerId}`);
          setBuyer(response);
        }
      } catch (error) {
        console.error('Failed to fetch buyer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [sale.buyerId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteResource(`/api/milk-sales/${sale._id}`);
      toast({
        title: language === 'en' ? 'Sale Deleted' : language === 'hi' ? 'बिक्री हटाई गई' : 'ਵਿਕਰੀ ਹਟਾਈ ਗਈ',
        description: language === 'en' ? 'The sale has been deleted successfully.' : language === 'hi' ? 'बिक्री सफलतापूर्वक हटा दी गई है।' : 'ਵਿਕਰੀ ਸਫਲਤਾਪੂਰਵਕ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ।',
      });
      onDelete(sale._id);
      onRefresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : language === 'hi' ? 'त्रुटि' : 'ਗਲਤੀ',
        description: error instanceof Error ? error.message : 'Failed to delete sale',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadInvoice = async () => {
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
        title: language === 'en' ? 'Invoice Generated' : language === 'hi' ? 'इनवॉइस जेनरेट किया गया' : 'ਇਨਵਾਇਸ ਜੇਨਰੇट ਕੀਤਾ ਗਿਆ',
        description: language === 'en' ? 'Invoice has been downloaded.' : language === 'hi' ? 'इनवॉइस डाउनलोड किया जा चुका है।' : 'ਇਨਵਾਇਸ ਡਾਊਨਲੋਡ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ।',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : language === 'hi' ? 'त्रुटि' : 'ਗਲਤੀ',
        description: language === 'en' ? 'Failed to generate invoice' : language === 'hi' ? 'इनवॉइस जेनरेट करने में विफल' : 'ਇਨਵਾਇਸ ਜੇਨਰੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {formatCurrency(sale.totalPrice, 'INR')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="text-xs">Loading...</span>
                    ) : (
                      buyer?.name || 'Unknown Buyer'
                    )}
                  </p>
                </div>
                <Badge variant={qualityBadgeVariants[sale.quality] || 'default'}>
                  {language === 'en' ? `Grade ${sale.quality}` : language === 'hi' ? `ग्रेड ${sale.quality}` : `ਗ੍ਰੇਡ ${sale.quality}`}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Quantity' : language === 'hi' ? 'मात्रा' : 'ਮਾਤਰਾ'}
                  </p>
                  <p className="font-medium">{sale.quantity} L</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Price/L' : language === 'hi' ? 'कीमत/लीटर' : 'ਕੀਮਤ/ਲੀ'}
                  </p>
                  <p className="font-medium">{formatCurrency(sale.pricePerLiter, 'INR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Date' : language === 'hi' ? 'तारीख' : 'ਤਾਰੀਖ'}
                  </p>
                  <p className="font-medium">{formatDate(sale.date)}</p>
                </div>
              </div>

              {sale.paymentStatus && (
                <div className="pt-2 border-t">
                  <Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {language === 'en' ? sale.paymentStatus : language === 'hi' ? (sale.paymentStatus === 'paid' ? 'भुगतान किया गया' : 'लंबित') : (sale.paymentStatus === 'paid' ? 'ਭੁਗਤਾਨ ਕੀਤਾ ਗਿਆ' : 'ਮੁਲਤਵੀ')}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(sale)}
                disabled={isDeleting}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadInvoice}
                disabled={isDeleting}
              >
                <Download className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'en' ? 'Delete Sale' : language === 'hi' ? 'बिक्री हटाएं' : 'ਵਿਕਰੀ ਹਟਾਓ'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'en' ? 'Are you sure? This action cannot be undone.' : language === 'hi' ? 'क्या आप निश्चित हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।' : 'ਕੀ ਤੁਸੀਂ ਨਿਸ਼ਚਿਤ ਹੋ? ਇਸ ਕਾਰਵਾਈ ਨੂੰ ਵਾਪਸ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogCancel>
                    {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'ਰੱਦ ਕਰੋ'}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {language === 'en' ? 'Delete' : language === 'hi' ? 'हटाएं' : 'ਹਟਾਓ'}
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
