import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  TrendingUp,
  Download,
  AlertCircle,
  Loader2,
  BarChart3,
  IndianRupee,
  Droplet,
  Calendar,
  Filter,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { SaleForm } from '@/components/SaleForm';
import { SaleCard } from '@/components/SaleCard';
import { InvoicePreview } from '@/components/InvoicePreview';
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
}

interface SalesStats {
  totalSales: number;
  totalQuantity: number;
  totalRevenue: number;
  avgPricePerLiter: number;
  avgQuantityPerSale: number;
  paidSales: number;
  pendingSales: number;
  partialSales?: number;
}

/**
 * Milk Sales Management Page
 * List, track, and manage milk sales with invoices
 */
export const MilkSales: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [sales, setSales] = useState<MilkSale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSale, setEditingSale] = useState<MilkSale | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<MilkSale | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Fetch sales and stats
  const fetchSalesAndStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
        ...(filterQuality !== 'all' && { quality: filterQuality }),
      });

      const [salesRes, statsRes] = await Promise.all([
        api.get(`/api/milk-sales?${queryParams}`),
        api.get(`/api/milk-sales/stats/overview?${queryParams}`),
      ]);

      setSales(Array.isArray(salesRes) ? salesRes : salesRes.data || []);
      setStats(statsRes || {});
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : language === 'hi' ? 'त्रुटि' : 'ਗਲਤੀ',
        description: language === 'en' ? 'Failed to fetch sales data' : language === 'hi' ? 'बिक्री डेटा प्राप्त करने में विफल' : 'ਵਿਕਰੀ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const response = await fetch(`${api.API_BASE_URL}/api/milk-sales/stats/overview?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchSalesAndStats();
  }, [dateRange, filterStatus, filterQuality]);

  const handleEditSale = (sale: MilkSale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchSalesAndStats();
    toast({
      title: language === 'en' ? 'Success' : language === 'hi' ? 'सफलता' : 'ਸਫਲਤਾ',
      description: language === 'en' ? 'Milk sale recorded successfully' : language === 'hi' ? 'दूध की बिक्री सफलतापूर्वक दर्ज की गई' : 'ਦੂਧ ਦੀ ਵਿਕਰੀ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੀ ਗਈ',
    });
  };

  const handleShowInvoicePreview = async (sale: MilkSale) => {
    setSelectedSale(sale);
    try {
      const buyer = await api.get(`/api/buyers/${sale.buyerId}`);
      setSelectedBuyer(buyer);
    } catch (error) {
      console.error('Failed to fetch buyer:', error);
    }
    setShowInvoicePreview(true);
  };

  useEffect(() => {
    fetchSalesAndStats();
  }, [dateRange, filterStatus, filterQuality]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              💰 {language === 'en' ? 'Milk Sales' : language === 'hi' ? 'दूध की बिक्री' : 'ਦੂਧ ਵਿਕਰੀ'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'en' ? 'Track and manage your milk sales' : language === 'hi' ? 'अपनी दूध की बिक्री को ट्रैक करें और प्रबंधित करें' : 'ਆਪਣੀ ਦੂਧ ਦੀ ਵਿਕਰੀ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ'}
            </p>
          </motion.div>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            {language === 'en' ? 'New Sale' : language === 'hi' ? 'नई बिक्री' : 'ਨਵੀਂ ਵਿਕਰੀ'}
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Total Sales' : language === 'hi' ? 'कुल बिक्री' : 'ਕੁਲ ਵਿਕਰੀ'}
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSales}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/10 border-cyan-200 dark:border-cyan-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Total Quantity' : language === 'hi' ? 'कुल मात्रा' : 'ਕੁਲ ਮਾਤਰਾ'}
                      </p>
                      <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                        {stats.totalQuantity?.toFixed(1) || 0}
                        <span className="text-lg ml-1">L</span>
                      </p>
                    </div>
                    <Droplet className="h-8 w-8 text-cyan-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Total Revenue' : language === 'hi' ? 'कुल राजस्व' : 'ਕੁਲ ਰਾਜ਼ਵੀ'}
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ₹{stats.totalRevenue?.toFixed(0) || 0}
                      </p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'en' ? 'Avg Price/L' : language === 'hi' ? 'औसत कीमत/लीटर' : 'ਔਸਤ ਕੀਮਤ/ਲੀ'}
                      </p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        ₹{stats.avgPricePerLiter?.toFixed(0) || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === 'en' ? 'Filters' : language === 'hi' ? 'फिल्टर' : 'ਫਿਲਟਰ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Payment Status' : language === 'hi' ? 'भुगतान स्थिति' : 'ਭੁਗਤਾਨ ਸਥਿਤੀ'}</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'en' ? 'All Status' : language === 'hi' ? 'सभी स्थिति' : 'ਸਾਰੀ ਸਥਿਤੀ'}</SelectItem>
                    <SelectItem value="paid">{language === 'en' ? 'Paid' : language === 'hi' ? 'भुगतान किया गया' : 'ਭੁਗਤਾਨ ਕੀਤਾ ਗਿਆ'}</SelectItem>
                    <SelectItem value="pending">{language === 'en' ? 'Pending' : language === 'hi' ? 'लंबित' : 'ਮੁਲਤਵੀ'}</SelectItem>
                    <SelectItem value="partial">{language === 'en' ? 'Partial' : language === 'hi' ? 'आंशिक' : 'ਆਂਸ਼ਿਕ'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'en' ? 'Quality Grade' : language === 'hi' ? 'गुणवत्ता ग्रेड' : 'ਗੁਣਵੱਤਾ ਗ੍ਰੇਡ'}</Label>
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'en' ? 'All Grades' : language === 'hi' ? 'सभी ग्रेड' : 'ਸਾਰੇ ਗ੍ਰੇਡ'}</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-date">{language === 'en' ? 'From' : language === 'hi' ? 'से' : 'ਤੋਂ'}</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-date">{language === 'en' ? 'To' : language === 'hi' ? 'तक' : 'ਤਾਈਂ'}</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{language === 'en' ? 'Recent Sales' : language === 'hi' ? 'हाल की बिक्री' : 'ਤਾਜ਼ਾ ਵਿਕਰੀ'}</CardTitle>
                <CardDescription>
                  {loading
                    ? language === 'en' ? 'Loading...' : language === 'hi' ? 'लोड हो रहा है...' : 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...'
                    : language === 'en' ? `${sales.length} sales in selected period` : language === 'hi' ? `${sales.length} चयनित अवधि में बिक्री` : `${sales.length} ਚੁਣੀ ਗਈ ਮਿਆਦ ਵਿੱਚ ਵਿਕਰੀ`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : sales.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {language === 'en'
                    ? 'No sales found. Start by adding your first sale.'
                    : language === 'hi'
                      ? 'कोई बिक्री नहीं मिली। अपनी पहली बिक्री जोड़कर शुरू करें।'
                      : 'ਕੋਈ ਵਿਕਰੀ ਨਹੀਂ ਮਿਲੀ। ਆਪਣੀ ਪਹਿਲੀ ਵਿਕਰੀ ਜੋੜ ਕੇ ਸ਼ੁਰੂ ਕਰੋ।'}
                </AlertDescription>
              </Alert>
            ) : (
              <AnimatePresence>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {sales.map((sale, index) => (
                    <SaleCard
                      key={sale._id}
                      sale={sale}
                      onEdit={handleEditSale}
                      onDelete={() => {}}
                      onRefresh={fetchSalesAndStats}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ y: -2 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {language === 'en' ? 'Paid Sales' : language === 'hi' ? 'भुगतान की गई बिक्री' : 'ਭੁਗਤਾਨ ਕੀਤੀ ਵਿਕਰੀ'}
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {stats.paidSales}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {language === 'en' ? 'Pending Sales' : language === 'hi' ? 'लंबित बिक्री' : 'ਮੁਲਤਵੀ ਵਿਕਰੀ'}
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                      {stats.pendingSales}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {language === 'en' ? 'Partial Sales' : language === 'hi' ? 'आंशिक बिक्री' : 'ਆਂਸ਼ਿਕ ਵਿਕਰੀ'}
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                      {stats.partialSales}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <SaleForm
        open={showForm}
        onOpenChange={handleFormClose}
        sale={editingSale}
        onSuccess={handleFormSuccess}
      />

      <InvoicePreview
        open={showInvoicePreview}
        onOpenChange={setShowInvoicePreview}
        sale={selectedSale}
        buyer={selectedBuyer}
      />
    </div>
  );

};

export default MilkSales;
