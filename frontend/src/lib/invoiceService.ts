/**
 * Invoice Generation Service
 * Creates PDF invoices for milk sales with multi-language support
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceData {
  invoiceNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAddress?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress?: string;
  saleDate: Date;
  quantity: number;
  pricePerLiter: number;
  totalPrice: number;
  quality?: string;
  fatContent?: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paymentMethod: string;
  notes?: string;
  language?: 'en' | 'hi' | 'pa';
}

interface TranslationStrings {
  invoice: string;
  invoiceNumber: string;
  date: string;
  seller: string;
  buyer: string;
  quantity: string;
  pricePerLiter: string;
  quality: string;
  fatContent: string;
  subTotal: string;
  total: string;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
  paid: string;
  pending: string;
  partial: string;
  phone: string;
  address: string;
}

const translations: Record<string, TranslationStrings> = {
  en: {
    invoice: 'Milk Sale Invoice',
    invoiceNumber: 'Invoice #',
    date: 'Date',
    seller: 'Seller (Farmer)',
    buyer: 'Buyer (Dairy)',
    quantity: 'Quantity (Liters)',
    pricePerLiter: 'Price per Liter',
    quality: 'Quality',
    fatContent: 'Fat Content',
    subTotal: 'Subtotal',
    total: 'Total Amount',
    paymentStatus: 'Payment Status',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    paid: 'Paid',
    pending: 'Pending',
    partial: 'Partial Payment',
    phone: 'Phone',
    address: 'Address',
  },
  hi: {
    invoice: 'दूध बिक्री चालान',
    invoiceNumber: 'चालान #',
    date: 'तारीख',
    seller: 'विक्रेता (किसान)',
    buyer: 'खरीदार (डेयरी)',
    quantity: 'मात्रा (लीटर)',
    pricePerLiter: 'प्रति लीटर मूल्य',
    quality: 'गुणवत्ता',
    fatContent: 'वसा सामग्री',
    subTotal: 'उप-कुल',
    total: 'कुल राशि',
    paymentStatus: 'भुगतान स्थिति',
    paymentMethod: 'भुगतान विधि',
    notes: 'नोट्स',
    paid: 'भुगतान किया गया',
    pending: 'लंबित',
    partial: 'आंशिक भुगतान',
    phone: 'फोन',
    address: 'पता',
  },
  pa: {
    invoice: 'ਦੁੱਧ ਵਿਕਰੀ ਇਨਵੁਆਇਸ',
    invoiceNumber: 'ਇਨਵੁਆਇਸ #',
    date: 'ਤਾਰੀਖ',
    seller: 'ਵਿਕਰੇਤਾ (ਕਿਸਾਨ)',
    buyer: 'ਖਰੀਦਾਰ (ਡੇਅਰੀ)',
    quantity: 'ਮਾਤਰਾ (ਲਿਟਰ)',
    pricePerLiter: 'ਪ್ਰਤੀ ਲਿਟਰ ਕੀਮਤ',
    quality: 'ਗੁਣਵਤਾ',
    fatContent: 'ਚਰਬੀ ਸਮੱਗਰੀ',
    subTotal: 'ਸਬ-ਟੋਟਲ',
    total: 'ਕੁੱਲ ਰਕਮ',
    paymentStatus: 'ਭੁਗਤਾਨ ਸਥਿਤੀ',
    paymentMethod: 'ਭੁਗਤਾਨ ਵਿਧੀ',
    notes: 'ਨੋਟਸ',
    paid: 'ਭੁਗਤਾਨ ਕੀਤਾ ਗਿਆ',
    pending: 'ਲੰਬਿਤ',
    partial: 'ਅੰਸ਼ਕ ਭੁਗਤਾਨ',
    phone: 'ਫੋਨ',
    address: 'ਪਤਾ',
  },
};

/**
 * Generate PDF invoice for a milk sale
 */
export async function generateInvoicePDF(
  data: InvoiceData,
  returnAsBlob: boolean = false
): Promise<void | Blob> {
  const lang = (data.language || 'en') as keyof typeof translations;
  const t = translations[lang];

  // Create HTML content for invoice
  const htmlContent = createInvoiceHTML(data, t);

  // Convert HTML to canvas
  const canvas = await html2canvas(document.getElementById('invoice-template') || createTempElement(htmlContent), {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  if (returnAsBlob) {
    return pdf.output('blob');
  }

  // Download PDF
  pdf.save(`Invoice_${data.invoiceNumber}.pdf`);
}

/**
 * Generate HTML for invoice
 */
function createInvoiceHTML(data: InvoiceData, t: TranslationStrings): string {
  const dateStr = new Date(data.saleDate).toLocaleDateString();
  const statusColor =
    data.paymentStatus === 'paid'
      ? '#10b981'
      : data.paymentStatus === 'partial'
        ? '#f59e0b'
        : '#ef4444';

  return `
    <div id="invoice-template" style="width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">🐄 Moo Music Tracker</h1>
        <h2 style="color: #666; margin: 10px 0; font-size: 20px;">${t.invoice}</h2>
      </div>

      <!-- Invoice Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap;">
        <div>
          <p style="margin: 5px 0; font-weight: bold;">${t.invoiceNumber}: ${data.invoiceNumber}</p>
          <p style="margin: 5px 0;">${t.date}: ${dateStr}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 5px 0; padding: 8px 12px; background-color: ${statusColor}; color: white; border-radius: 4px; font-weight: bold;">
            ${
              data.paymentStatus === 'paid'
                ? t.paid
                : data.paymentStatus === 'partial'
                  ? t.partial
                  : t.pending
            }
          </p>
        </div>
      </div>

      <!-- Seller and Buyer -->
      <div style="display: flex; gap: 40px; margin-bottom: 30px;">
        <div style="flex: 1;">
          <h3 style="color: #3b82f6; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
            ${t.seller}
          </h3>
          <p style="margin: 5px 0; font-weight: bold;">${data.farmerName || 'N/A'}</p>
          <p style="margin: 5px 0;">${t.phone}: ${data.farmerPhone || 'N/A'}</p>
          ${data.farmerAddress ? `<p style="margin: 5px 0;">${t.address}: ${data.farmerAddress}</p>` : ''}
        </div>

        <div style="flex: 1;">
          <h3 style="color: #3b82f6; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
            ${t.buyer}
          </h3>
          <p style="margin: 5px 0; font-weight: bold;">${data.buyerName}</p>
          <p style="margin: 5px 0;">${t.phone}: ${data.buyerPhone}</p>
          ${data.buyerAddress ? `<p style="margin: 5px 0;">${t.address}: ${data.buyerAddress}</p>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f3f4f6; border: 1px solid #e5e7eb;">
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">${t.quantity}</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${t.pricePerLiter} (₹)</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${t.total} (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border: 1px solid #e5e7eb;">
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.quantity} L</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">₹${data.pricePerLiter.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">₹${data.totalPrice.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Quality Details -->
      ${
        data.quality || data.fatContent
          ? `
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          ${data.quality ? `<p style="margin: 5px 0;"><strong>${t.quality}:</strong> ${data.quality}</p>` : ''}
          ${data.fatContent ? `<p style="margin: 5px 0;"><strong>${t.fatContent}:</strong> ${data.fatContent}%</p>` : ''}
        </div>
      `
          : ''
      }

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #e5e7eb;">
            <span style="font-weight: bold;">${t.total}:</span>
            <span style="font-weight: bold; color: #10b981; font-size: 18px;">₹${data.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>${t.paymentStatus}:</strong> 
          ${
            data.paymentStatus === 'paid'
              ? '✓ ' + t.paid
              : data.paymentStatus === 'partial'
                ? '◐ ' + t.partial
                : '⏳ ' + t.pending
          }
        </p>
        <p style="margin: 5px 0;"><strong>${t.paymentMethod}:</strong> ${data.paymentMethod}</p>
      </div>

      <!-- Notes -->
      ${
        data.notes
          ? `
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
          <p style="margin: 0;"><strong>${t.notes}:</strong></p>
          <p style="margin: 5px 0; white-space: pre-wrap;">${data.notes}</p>
        </div>
      `
          : ''
      }

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; color: #666; font-size: 12px;">
        <p>Generated by Moo Music Tracker | ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

/**
 * Create temporary element for HTML to Canvas conversion
 */
function createTempElement(html: string): HTMLElement {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  temp.style.width = '800px';
  temp.style.backgroundColor = 'white';
  document.body.appendChild(temp);
  return temp;
}

/**
 * Generate and download invoice
 */
export async function downloadInvoice(data: InvoiceData): Promise<void> {
  try {
    await generateInvoicePDF(data);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

/**
 * Generate invoice as blob for upload/sharing
 */
export async function generateInvoiceBlob(data: InvoiceData): Promise<Blob> {
  try {
    const blob = await generateInvoicePDF(data, true);
    if (!blob) throw new Error('Failed to generate blob');
    return blob;
  } catch (error) {
    console.error('Error generating invoice blob:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}
// Alias for convenience
export const generateInvoice = generateInvoicePDF;