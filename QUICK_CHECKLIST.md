# 📋 Quick Reference - Milk Sales Feature Development Checklist

## 🎯 Print This & Check Off As You Go!

---

## PRE-WORK SETUP

### Environment Verification
- [ ] Backend server running (`npm start` from `/backend` folder)
- [ ] Frontend dev server running (`npm run dev` from `/frontend` folder)
- [ ] MongoDB Atlas connected (check `/backend/config/`)
- [ ] Postman or Insomnia open for API testing
- [ ] VS Code with workspace open

### Code Review (Read These First!)
- [ ] Read: `/frontend/src/lib/api.ts` (understand API pattern)
- [ ] Read: `/frontend/src/pages/History.tsx` (understand page structure)
- [ ] Read: `/frontend/src/pages/Index.tsx` (understand landing page)
- [ ] Read: Existing MongoDB model in `/backend/models/Session.js` or similar
- [ ] Understand: REST API pattern (GET, POST, PATCH, DELETE)

### Install Dependencies
```bash
cd /Users/ankitsingh/Development/assessment/animal/frontend
npm install jspdf html2canvas qrcode.react
```
- [ ] jsPDF installed (for PDF generation)
- [ ] html2canvas installed (for HTML to image)
- [ ] qrcode.react installed (optional, for QR codes)

### Git Preparation
```bash
cd /Users/ankitsingh/Development/assessment/animal
git status  # Should be clean
```
- [ ] No uncommitted changes
- [ ] On main branch
- [ ] Ready to commit

---

## PHASE 1: BACKEND DATABASE & API (4-5 Hours)

### ✅ TASK 1.1: Create MilkSale MongoDB Schema (1 hour)

**File to create:** `/backend/models/MilkSale.js`

Checklist:
- [ ] File created at correct path
- [ ] Schema includes all fields:
  - [ ] seller_id (String)
  - [ ] buyer_name (String, required)
  - [ ] quantity_liters (Number, required, 0-100)
  - [ ] price_per_liter (Number, required, 0-200)
  - [ ] total_amount (Number, auto-calculated)
  - [ ] date_sold (Date, required)
  - [ ] payment_status (String: "paid"/"pending"/"partial")
  - [ ] payment_method (String: "cash"/"bank"/"cheque")
  - [ ] buyer_contact (String, phone format)
  - [ ] buyer_address (String)
  - [ ] notes (String, optional)
  - [ ] created_at (Date, auto)
  - [ ] updated_at (Date, auto)
- [ ] Validation rules added:
  - [ ] quantity_liters: { type: Number, min: 0.1, max: 100 }
  - [ ] price_per_liter: { type: Number, min: 1, max: 200 }
- [ ] Pre-save hook to auto-calculate total_amount
- [ ] Indexes created on: buyer_name, date_sold, seller_id
- [ ] Model exported correctly

**Testing:**
- [ ] Can require model in test file
- [ ] No validation errors in console

---

### ✅ TASK 1.2: Create Backend API Endpoints (2-3 hours)

**Files to create:**
- `/backend/routes/milkSalesRoutes.js`
- `/backend/controllers/milkSalesController.js`

#### Endpoint 1: POST /api/milk-sales (Create Sale)
Checklist:
- [ ] Route defined: `router.post('/', controllerFunction)`
- [ ] Controller function:
  - [ ] Validates required fields (buyer_name, quantity, price, date)
  - [ ] Creates new MilkSale document
  - [ ] Returns created document with _id
  - [ ] Error handling (try/catch)
- [ ] Test with Postman:
  - [ ] Send: `{ buyer_name: "दिल्ली कोऑप", quantity_liters: 50, price_per_liter: 45, date_sold: "2026-02-08" }`
  - [ ] Response: 201 Created with full document
  - [ ] Check: total_amount auto-calculated (50 × 45 = 2250)

#### Endpoint 2: GET /api/milk-sales (List Sales)
Checklist:
- [ ] Route defined with query params support
- [ ] Query parameters working:
  - [ ] `?limit=20&skip=0` (pagination)
  - [ ] `?start_date=2026-01-01&end_date=2026-02-08` (date filter)
  - [ ] `?buyer_name=दिल्ली` (search by buyer)
- [ ] Sorting: newest first (`sort: { created_at: -1 }`)
- [ ] Test with Postman:
  - [ ] GET /api/milk-sales → Returns array of all sales
  - [ ] GET /api/milk-sales?limit=10 → Returns 10 sales
  - [ ] GET /api/milk-sales?buyer_name=दिल्ली → Filters correctly

#### Endpoint 3: GET /api/milk-sales/:id (Get One Sale)
Checklist:
- [ ] Route defined: `router.get('/:id', ...)`
- [ ] Returns single sale document
- [ ] Error: 404 if sale not found
- [ ] Test with Postman:
  - [ ] GET /api/milk-sales/[valid-id] → Returns single sale
  - [ ] GET /api/milk-sales/invalid → 404 error

#### Endpoint 4: PATCH /api/milk-sales/:id (Update Sale)
Checklist:
- [ ] Route defined: `router.patch('/:id', ...)`
- [ ] Can update: buyer_name, quantity, price, date, payment_status, notes
- [ ] Recalculates total_amount if quantity or price changes
- [ ] Returns updated document
- [ ] Test with Postman:
  - [ ] PATCH with new quantity → total_amount recalculates
  - [ ] PATCH payment_status → Updates correctly

#### Endpoint 5: DELETE /api/milk-sales/:id (Delete Sale)
Checklist:
- [ ] Route defined: `router.delete('/:id', ...)`
- [ ] Removes document from database
- [ ] Returns success message
- [ ] Test with Postman:
  - [ ] DELETE /api/milk-sales/[id] → Removed
  - [ ] GET /api/milk-sales/[id] → 404 (deleted)

#### Endpoint 6: GET /api/milk-sales/stats/summary (Stats)
Checklist:
- [ ] Route defined
- [ ] Returns:
  - [ ] total_sales (count of sales)
  - [ ] total_liters (sum of all quantity_liters)
  - [ ] total_income (sum of all total_amount)
  - [ ] avg_price (average price_per_liter)
  - [ ] pending_payments (sum where payment_status="pending")
  - [ ] top_buyer (buyer with most purchases)
- [ ] Test with Postman:
  - [ ] GET /api/milk-sales/stats/summary → Returns stats object

**Integration Check:**
- [ ] Routes registered in main `/backend/server.js` or routes file
- [ ] All 6 endpoints working in Postman
- [ ] No console errors
- [ ] Database has test data (at least 2-3 sales)

---

### ✅ TASK 1.3: Create Buyer Management Backend (1-2 hours)

**Files to create:**
- `/backend/models/Buyer.js`
- `/backend/routes/buyersRoutes.js`
- `/backend/controllers/buyersController.js`

#### Buyer Schema Checklist:
- [ ] Schema fields:
  - [ ] seller_id (String)
  - [ ] buyer_name (String, required)
  - [ ] contact_number (String, WhatsApp format)
  - [ ] address (String)
  - [ ] city (String)
  - [ ] current_price_per_liter (Number)
  - [ ] last_purchase_date (Date)
  - [ ] total_purchases_liters (Number)
  - [ ] created_at, updated_at

#### Buyer API Endpoints Checklist:
- [ ] POST /api/buyers (Create)
- [ ] GET /api/buyers (List all)
- [ ] GET /api/buyers/:id (Get one)
- [ ] PATCH /api/buyers/:id (Update)
- [ ] GET /api/buyers/:id/history (Get all sales to this buyer)
- [ ] Test all in Postman

**Integration Check:**
- [ ] When creating milk sale, can find and auto-update buyer
- [ ] Buyer endpoints working
- [ ] No console errors

---

## ✅ PHASE 1 COMPLETE
- [ ] All 6 milk-sales endpoints tested and working
- [ ] All buyer endpoints working
- [ ] Sample data in MongoDB
- [ ] Ready for frontend development
- [ ] Commit: `git add -A && git commit -m "feat: Add milk sales backend API and schema"`

---

## PHASE 2: FRONTEND COMPONENTS (6-8 Hours)

### ✅ TASK 2.1: Create MilkSales Page Component (3-4 hours)

**File to create:** `/frontend/src/pages/MilkSales.tsx`

**Page Structure Checklist:**
- [ ] Header component:
  - [ ] Back arrow button
  - [ ] Title: "Milk Sales" (with translations)
  - [ ] Language toggle
  - [ ] Theme toggle
- [ ] Quick stats section showing:
  - [ ] Total Income: ₹X,XXX
  - [ ] Total Liters: X L
  - [ ] Average Price: ₹X/L
- [ ] Action buttons:
  - [ ] "+ New Sale" button
  - [ ] Filter toggle
- [ ] Filter section (hidden by default):
  - [ ] Date range picker
  - [ ] Search buyer field
  - [ ] Payment status filter
- [ ] Sales list (cards or table):
  - [ ] Each sale shows: buyer name, quantity, price, total, date
  - [ ] Edit and Delete buttons on each
- [ ] Loading state:
  - [ ] Show skeleton cards while fetching
- [ ] Error state:
  - [ ] Show error message with retry button
- [ ] Empty state:
  - [ ] Show "No sales yet" message with button to add

**Functionality Checklist:**
- [ ] `useEffect` calls `GET /api/milk-sales` on mount
- [ ] `useEffect` calls `GET /api/milk-sales/stats/summary` for stats
- [ ] Shows loading skeleton while fetching
- [ ] Displays sales in cards with proper formatting
- [ ] Date formatting in local language (Hindi/English)
- [ ] Currency formatting with ₹ symbol
- [ ] Click Edit button → opens edit dialog
- [ ] Click Delete button → confirmation → delete
- [ ] Filtering works by date range
- [ ] Search works by buyer name
- [ ] Animations using framer-motion

**Testing Checklist:**
- [ ] Page loads without errors
- [ ] Sales fetched and displayed
- [ ] Stats show correct totals
- [ ] Filters work correctly
- [ ] All buttons clickable
- [ ] Mobile responsive (test on small screen)
- [ ] Language switching works
- [ ] No console errors

---

### ✅ TASK 2.2: Create Sale Entry Form (2 hours)

**Files to create:**
- `/frontend/src/components/SaleForm.tsx`
- `/frontend/src/components/SaleEditDialog.tsx`
- `/frontend/src/hooks/useMilkSales.ts` (optional custom hook)

**Form Fields Checklist:**
- [ ] Buyer Name input:
  - [ ] Autocomplete from existing buyers
  - [ ] Allow custom entry
  - [ ] Required validation
- [ ] Quantity (Liters) input:
  - [ ] Type: number
  - [ ] Min: 0.1, Max: 100
  - [ ] Show in liters (L)
  - [ ] Required
- [ ] Price per Liter input:
  - [ ] Type: number
  - [ ] Min: 1, Max: 200
  - [ ] Show rupee symbol (₹)
  - [ ] Required
- [ ] Date Sold input:
  - [ ] Date picker
  - [ ] Cannot select future date
  - [ ] Required
- [ ] Payment Status:
  - [ ] Radio buttons: Paid / Pending
  - [ ] Default: Paid
- [ ] Payment Method:
  - [ ] Radio buttons: Cash / Bank / Cheque
  - [ ] Optional
- [ ] Buyer Contact:
  - [ ] Phone number field
  - [ ] Format for WhatsApp (+91...)
  - [ ] Optional
- [ ] Notes:
  - [ ] Text area
  - [ ] Optional
- [ ] Auto-calculation:
  - [ ] Show total: quantity × price
  - [ ] Update in real-time as user types

**Form Validation Checklist:**
- [ ] All required fields validated
- [ ] Quantity: 0 < value <= 100
- [ ] Price: 0 < value <= 200
- [ ] Date: <= today
- [ ] Error messages shown in red
- [ ] Submit button disabled if errors exist

**Functionality Checklist:**
- [ ] "New Sale" button opens form in modal
- [ ] "Edit" button on each sale opens form pre-filled
- [ ] Form submit calls:
  - [ ] POST /api/milk-sales (new sale)
  - [ ] PATCH /api/milk-sales/:id (edit sale)
- [ ] Success: Show toast notification
- [ ] Success: Close modal
- [ ] Success: Refresh sales list
- [ ] Error: Show error toast
- [ ] Cancel button closes without saving

**Testing Checklist:**
- [ ] Form opens when clicking "+ New Sale"
- [ ] Form validates all fields
- [ ] Total calculates correctly
- [ ] Submit creates new sale (check in database)
- [ ] Edit form pre-fills correctly
- [ ] Edit save updates database
- [ ] Toast notifications appear
- [ ] Form closes after submit
- [ ] Sales list refreshes after add/edit
- [ ] No console errors

---

### ✅ TASK 2.3: Create Invoice Generator (2-3 hours)

**Files to create:**
- `/frontend/src/services/invoiceService.ts`
- `/frontend/src/components/InvoicePreview.tsx` (optional modal)

**Invoice Template Checklist:**
- [ ] Header:
  - [ ] Company logo/name: "🐄 MOO MUSIC TRACKER"
  - [ ] Title: "दूध विक्रय पर्ची" (Milk Sale Invoice)
  - [ ] Invoice number: MM-YYYY-XXXX (auto-generate)
  - [ ] Date and time of invoice creation
- [ ] Seller Information:
  - [ ] Name (from farmer profile)
  - [ ] Phone number
  - [ ] Address
  - [ ] City
- [ ] Buyer Information:
  - [ ] Buyer name
  - [ ] Contact number
  - [ ] Address
  - [ ] City
- [ ] Sale Details Table:
  - [ ] Description: "Fresh Cow Milk"
  - [ ] Quantity: "50 L"
  - [ ] Rate: "₹45/L"
  - [ ] Amount: "₹2250"
- [ ] Summary:
  - [ ] Total Amount (in words: "Two Thousand Two Hundred Fifty Rupees Only")
  - [ ] Payment Status
  - [ ] Payment Method
- [ ] Footer:
  - [ ] Notes/special terms
  - [ ] "Thank you for your business" message
  - [ ] Bilingual (English + Hindi)

**PDF Generation Checklist:**
- [ ] Uses jsPDF library
- [ ] Paper size: A4
- [ ] Proper margins and spacing
- [ ] Fonts support Hindi characters
- [ ] Currency symbol (₹) displays correctly
- [ ] Page has proper formatting

**Invoice Functions Checklist:**
- [ ] `generateInvoicePDF(sale)` - Creates PDF
- [ ] Download as PDF:
  - [ ] Filename: `invoice-MM-YYYY-XXXX.pdf`
  - [ ] Browser download triggered
- [ ] Print option:
  - [ ] Opens print dialog
  - [ ] Proper page layout
- [ ] Share via WhatsApp:
  - [ ] Pre-filled message
  - [ ] Includes sale details
  - [ ] Opens WhatsApp on mobile

**Button Placement Checklist:**
- [ ] Each sale card/row has "Invoice" button
- [ ] "Invoice" button opens PDF generation
- [ ] Shows "Downloading..." while generating
- [ ] PDF downloads successfully
- [ ] Error handling if generation fails

**Testing Checklist:**
- [ ] Generate invoice for a sale
- [ ] PDF downloads correctly
- [ ] PDF opens with proper formatting
- [ ] Text is readable (not cut off)
- [ ] Hindi text displays correctly
- [ ] Currency symbols show
- [ ] Date/time correct
- [ ] Invoice number unique
- [ ] Print option works
- [ ] WhatsApp share works (mobile)
- [ ] No console errors

---

## ✅ PHASE 2 COMPLETE
- [ ] MilkSales page created and displays data
- [ ] Form adds new sales successfully
- [ ] Form edits existing sales
- [ ] Invoice generates and downloads
- [ ] All features tested locally
- [ ] Commit: `git add -A && git commit -m "feat: Add milk sales frontend pages and forms"`

---

## PHASE 3: INTEGRATION & ROUTING (2 Hours)

### ✅ TASK 3.1: Add Routes to App.tsx (30 mins)

**File to modify:** `/frontend/src/App.tsx`

Checklist:
- [ ] Import MilkSales page: `import MilkSales from "./pages/MilkSales"`
- [ ] Import BuyerDirectory page (create or skip for now)
- [ ] Add route:
  ```tsx
  <Route path="/milk-sales" element={<MilkSales />} />
  ```
- [ ] Test:
  - [ ] Navigate to http://localhost:5173/milk-sales
  - [ ] Page loads without errors
  - [ ] Back button works

---

### ✅ TASK 3.2: Add Navigation Buttons to Index.tsx (30 mins)

**File to modify:** `/frontend/src/pages/Index.tsx`

Checklist:
- [ ] Add import: `import { ShoppingCart, Users } from 'lucide-react'`
- [ ] Add navigation buttons in features section:
  ```tsx
  <NavLink to="/milk-sales">
    <ShoppingCart className="h-6 w-6" />
    {t.milkSales}
  </NavLink>
  ```
- [ ] Test:
  - [ ] Buttons visible on home page
  - [ ] Clicking navigates to milk sales page
  - [ ] Mobile responsive

---

### ✅ TASK 3.3: Add Translations (30 mins)

**File to modify:** `/frontend/src/contexts/LanguageContext.tsx`

Add to `en` section:
```typescript
milkSales: 'Milk Sales',
newSale: 'New Sale',
buyerName: 'Buyer Name',
quantityLiters: 'Quantity (Liters)',
pricePerLiter: 'Price per Liter (₹)',
dateSold: 'Date Sold',
totalAmount: 'Total Amount',
paymentStatus: 'Payment Status',
paid: 'Paid',
pending: 'Pending',
generateInvoice: 'Generate Invoice',
// ... more keys
```

Add to `hi` section (Hindi translations):
```typescript
milkSales: 'दूध विक्रय',
newSale: 'नया विक्रय',
buyerName: 'खरीदार का नाम',
// ... more in Hindi
```

Add to `pa` section (Punjabi translations):
```typescript
milkSales: 'ਦਧ ਵਿਕਰਤੀ',
newSale: 'ਨਵੀਂ ਵਿਕਰਤੀ',
// ... more in Punjabi
```

Checklist:
- [ ] All new UI text has translation keys
- [ ] Keys added in all 3 languages (EN, HI, PA)
- [ ] Translations are accurate
- [ ] Language toggle works
- [ ] No missing translations (no blank text)

---

## ✅ PHASE 3 COMPLETE
- [ ] Routes added to App.tsx
- [ ] Navigation buttons on home page
- [ ] All translations added
- [ ] Language switching works for all new text
- [ ] Commit: `git add -A && git commit -m "feat: Integrate milk sales routing and translations"`

---

## FINAL VERIFICATION (1 Hour)

### Build & Deployment Check
```bash
cd /frontend
npm run build
```
- [ ] Build completes without errors
- [ ] No warnings about unused code
- [ ] Bundle size reasonable (check output)

### Manual Testing (Desktop)
- [ ] Click "Milk Sales" button from home
- [ ] Page loads with empty or existing sales
- [ ] Click "+ New Sale"
- [ ] Fill form with test data
- [ ] Click "Save" → Sale added to list
- [ ] Click "Edit" on a sale → Form pre-fills
- [ ] Edit and save → List updates
- [ ] Click "Delete" → Confirmation dialog → Sale removed
- [ ] Click "Invoice" → PDF downloads
- [ ] Filter by date range → Works
- [ ] Search by buyer → Works
- [ ] Switch language → All text updates

### Mobile Testing (if available)
- [ ] Page responsive on small screen
- [ ] Touch interactions work
- [ ] Form inputs sized appropriately
- [ ] Buttons easily clickable

### Browser Console
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No 404 API calls

### Deployment to S3
```bash
npm run build
aws s3 sync dist/ s3://moo-music-tracker/
```
- [ ] Build successful
- [ ] Files synced to S3
- [ ] Website accessible at domain
- [ ] Features work on production

---

## 🎉 CELEBRATION CHECKLIST

If all above items checked:

- [ ] ✅ Milk Sales feature complete
- [ ] ✅ Backend API working
- [ ] ✅ Frontend pages working
- [ ] ✅ Forms validating and saving
- [ ] ✅ Invoices generating
- [ ] ✅ All languages supported
- [ ] ✅ Deployed to production

**Farmer Can Now:**
- ✅ Record milk sales quickly
- ✅ View total income
- ✅ Generate professional invoices
- ✅ Download invoices for bank loans
- ✅ Use in their preferred language

---

## 🚨 Common Issues & Solutions

### Issue: API endpoints not found (404)
**Solution:** 
- Check that routes are registered in `/backend/server.js`
- Verify controller functions exist
- Restart backend server
- Check API_BASE_URL in frontend

### Issue: Form not submitting
**Solution:**
- Check browser console for errors
- Verify API endpoint URL is correct
- Check that all required fields have values
- Check CORS settings in backend

### Issue: Hindi text shows as squares/boxes
**Solution:**
- Check jsPDF font settings
- Add Noto Sans Hindi font to jsPDF
- Use UTF-8 encoding

### Issue: Total amount not calculating
**Solution:**
- Check form validation logic
- Verify input values are numbers
- Check auto-calculate formula

### Issue: Build fails after changes
**Solution:**
- Run: `npm install` to ensure all dependencies
- Clear cache: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Look at error message carefully

---

**Last Updated:** February 8, 2026  
**Estimated Total Time:** 16-20 hours  
**Difficulty Level:** Medium  
**Next Step:** Begin PHASE 1 Task 1.1
