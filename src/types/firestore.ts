// Timestamp type - ISO 8601 string for Supabase compatibility
export type Timestamp = string;

// ============================================
// User & Auth
// ============================================
export type UserRole = 'admin' | 'customer' | 'concierge' | 'staff';
export type LoyaltyTier = 'classic' | 'prestige' | 'black';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  photoURL?: string;
  shippingAddresses?: Address[];
  tags?: string[];
  loyaltyTier: LoyaltyTier;
  totalSpend: number;
  notes?: string; // CRM-04: Admin internal notes
  hasAccount: boolean; // True if customer can login (has Supabase Auth), false if admin-created
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Customer Preferences (Analytics)
// ============================================
export interface CategoryPreference {
  category: string;
  count: number;
  spend: number;
  percentage?: number;
}

export interface BrandPreference {
  brand: string;
  count: number;
  spend: number;
  percentage?: number;
}

export interface ColorPreference {
  color: string;
  count: number;
  percentage?: number;
}

export interface SizePattern {
  primary?: string;
  secondary?: string;
}

export interface PriceAnalysis {
  avgItemPrice: number;
  preferredRange?: 'low' | 'mid' | 'high' | 'luxury';
  ranges: {
    low?: number;
    mid?: number;
    high?: number;
    luxury?: number;
  };
}

export interface CustomerPreferences {
  favoriteCategories: CategoryPreference[];
  favoriteBrands: BrandPreference[];
  sizePatterns: Record<string, SizePattern>;
  colorPreferences: ColorPreference[];
  priceAnalysis: PriceAnalysis;
  totalOrders: number;
  totalItems: number;
  totalSpendEur: number;
  avgOrderValueEur: number;
  avgItemsPerOrder: number;
  avgDaysBetweenOrders?: number;
  preferredOrderDayOfWeek?: number; // 0=Sunday, 6=Saturday
  inferredGender?: 'men' | 'women' | 'mixed';
  lastComputedAt?: string;
}

// ============================================
// Products & Variants
// ============================================
export interface LocalizedString {
  en: string;
  ar: string;
}

/**
 * ProductSize - The specific stock keeping unit (secondary attribute)
 * Note: Named "size" for legacy reasons but represents any secondary option:
 * - Shoes/Clothes: actual size (43, M, L)
 * - Perfumes: volume (50ml, 100ml)
 * - Watches: case size (40mm, 42mm)
 * - Cosmetics: finish type or One Size
 */
export interface ProductSize {
    size: string;           // e.g. "43", "M", "100ml", "40mm"
    sku: string;            // Unique SKU
    stock: number;          // Current stock level
    price?: number;         // Optional override
    cost?: number;          // Optional override
    barcode?: string;
}

/**
 * ProductVariant - Grouped by primary attribute (Variant)
 * Note: The "color" field is named for legacy reasons but represents any primary variant:
 * - Shoes/Clothes/Bags: actual color (Black, Navy)
 * - Perfumes: concentration (EDP, EDT, Parfum)
 * - Watches: material (Steel, Gold, Titanium)
 * - Cosmetics: shade code (Parade 629, Nude 001)
 */
export interface ProductVariant {
    color: string;          // Primary variant: color, material, shade, concentration, etc.
    colorCode?: string;     // Hex code for UI (only meaningful for actual colors/shades)
    images: string[];       // Images specific to this variant
    sizes: ProductSize[];   // Secondary options (size, volume, case size, etc.)
    sizeSystem?: string;    // e.g. 'EU', 'US' - defaults to 'EU' if missing
}

/**
 * Product - Parent Entity (Brand + Model)
 */
export interface Product {
  id: string;
  // Standardized naming (AI-02): Brand + Model
  brand: string;             // e.g. "On Running", "Louis Vuitton"
  model: string;             // e.g. "Cloudtilt", "Neverfull MM"
  category: string;          // e.g. "shoes", "bags", "watches"
  // Display names
  name: LocalizedString;     // Can be auto-generated: "{brand} {model}"
  description: LocalizedString;
  
  // Base Financials (Defaults)
  price: number;             // Base EUR price 
  cost: number;              // Base supply cost EUR
  
  // Variants
  variants: ProductVariant[];

  // Media & Status
  images: string[];          // General product images
  isActive: boolean;
  show_out_of_stock?: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Stock Lots (Dynamic Inventory)
// ============================================
/**
 * StockLot - Represents physical inventory batches
 * Now explicitly defines item details (size, color) at the lot level
 * No need for pre-defined variants in Product
 */
export interface StockLot {
  id: string;
  product_id: string;        // Reference to parent product
  
  // Dynamic Item Definition
  sku: string;               // Generated: {Brand}-{Model}-{Color}-{Size}
  size?: string;             // Defined at receive time
  color?: string;            // Defined at receive time
  
  // Financials
  quantity: number;          // Units received
  remaining: number;         // Units still available
  cost_per_unit: number;     // Supply cost (EUR)
  price_eur: number;         // Selling price (EUR) for this batch
  
  // Meta
  supplier?: string;         // Legacy string name
  supplier_id?: string;      // Reference to Vendor
  received_at: Timestamp | string;
  notes?: string;
  created_at: Timestamp;
}

export interface StockSummary {
  sku: string;
  total_quantity: number;
  avg_cost: number;
  total_value: number;
}


// ============================================
export type OrderType = 'stock' | 'concierge' | 'mixed';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type Currency =  'USD' | 'LYD' | 'EUR';

export interface Address {
  street?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  id?: string; // Add ID for tracking
  type: 'stock' | 'concierge'; // NEW: Item-level type
  productId?: string;
  name: string;
  quantity: number;
  unitPriceEUR: number;
  unitPriceLocal: number;
  unitCostEUR?: number;
  attributes?: { size?: string; color?: string; sku?: string };
  image?: string; // NEW: Product image URL for invoice/display
  notes?: string; // For concierge custom item details
  // Legacy properties for backward compatibility with existing data
  variantColor?: string;
  size?: string;
  sku?: string;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerLoyaltyTier?: LoyaltyTier; // Added for snapshot

  type: OrderType;
  status: OrderStatus;

  currency: Currency;
  exchangeRate: number;
  totalAmountEUR: number;
  subtotalEUR?: number; // Added
  totalAmountLocal?: number;
  shippingFeeLocal?: number;
  deliveryFee?: number; // Added
  
  // Discount
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmountEur?: number;
  couponCode?: string;

  depositAmountLocal?: number;
  isDepositVerified?: boolean;
  depositCurrency?: Currency;
  depositExchangeRate?: number;

  items: OrderItem[];

  shippingAddress: Address;
  trackingNumber?: string;
  courier?: string;
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- Financial Module ---

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'vendor_credit';
  currency: Currency; // Base currency
  balance: number;
  book_value_eur: number; // Theoretical EUR value for FX gain/loss tracking
  is_active: boolean;
  vendor?: string; // Required for vendor_credit type - restricts spending to this vendor only
  created_at: Timestamp;
  updated_at: Timestamp;
}

// --- Equipment / Fixed Assets ---
export type EquipmentCategory = 'computer' | 'phone' | 'furniture' | 'vehicle' | 'machinery' | 'other';

export interface Equipment {
  id: string;
  name: string;                    // e.g., "MacBook Pro 16", "iPhone 15 Pro"
  category: EquipmentCategory;
  purchase_date: string;           // DATE format
  purchase_price: number;          // Original purchase price
  current_value: number;           // Current book value (after depreciation)
  currency: Currency;              // Currency of the equipment value
  depreciation_rate?: number;      // Annual depreciation % (e.g., 20 = 20% per year)
  serial_number?: string;
  assigned_to?: string;            // Person or department
  location?: string;
  notes?: string;
  is_active: boolean;              // false = disposed/sold
  disposed_date?: string;
  disposed_value?: number;         // Sale price if sold
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Expense {
  id: string;
  type: 'internal' | 'purchase';
  category: string; // e.g. "Rent", "Marketing", "Stock Purchase" (legacy)
  category_id?: string; // Reference to expense_categories
  description: string;
  amount: number;
  currency: Currency;
  date: Timestamp;
  account_id?: string; // Paid from this account (optional if unpaid)
  vendor_id?: string; // Reference to expense_vendors
  bill_id?: string; // Reference to bills (if created from bill payment)
  recurring_payment_id?: string; // Reference to recurring_payments (if auto-generated)
  status: 'paid' | 'unpaid' | 'reverted';
  due_date?: Timestamp; // Required if unpaid
  related_ref?: string; // ID of StockLot or Order if applicable
  receiptUrl?: string; // URL to receipt image
  is_special?: boolean; // For special expenses like shipping to distribute across orders
  linked_order_ids?: string[]; // Orders this expense is distributed across
  created_at: Timestamp;
}

// ============================================
// Finance Module - Extended Types
// ============================================

export type ExpenseCategoryType = 'opex' | 'capex' | 'cogs' | 'payroll';

export interface ExpenseCategory {
  id: string;
  code: string; // e.g. 'OPEX.RENT', 'PAYROLL.SALARIES'
  name_en: string;
  name_ar?: string;
  type: ExpenseCategoryType;
  parent_id?: string;
  is_active: boolean;
  created_at: Timestamp;
}

export interface ExpenseVendor {
  id: string;
  name: string;
  contact_phone?: string;
  contact_email?: string;
  default_category_id?: string;
  payment_terms_days: number;
  notes?: string;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

export interface RecurringPayment {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: Currency;
  category_id?: string;
  vendor_id?: string;
  account_id?: string;

  // Frequency configuration
  frequency: RecurringFrequency;
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly

  // Schedule tracking
  start_date: string; // DATE type
  end_date?: string;
  next_due_date: string;
  last_generated_date?: string;

  // Behavior
  is_active: boolean;
  auto_pay: boolean;
  reminder_days: number;

  created_at: Timestamp;
  updated_at: Timestamp;
}

export type BillStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface Bill {
  id: string;
  bill_number?: string;
  vendor_id?: string;
  vendor_name?: string;

  amount: number;
  currency: Currency;
  amount_paid: number;

  category_id?: string;
  description?: string;

  issue_date: string; // DATE type
  due_date: string;

  status: BillStatus;

  paid_date?: string;
  account_id?: string;
  recurring_payment_id?: string;
  expense_id?: string;

  receipt_url?: string;
  notes?: string;

  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ReceivableStatus = 'pending' | 'partial' | 'received' | 'cancelled' | 'written_off';
export type ReceivableSourceType = 'vendor_refund' | 'po_refund' | 'overpayment' | 'other';

export interface Receivable {
  id: string;
  reference_number?: string;

  // Source
  vendor_id?: string;
  vendor_name?: string;
  source_type: ReceivableSourceType;

  // Amounts
  amount: number;
  currency: Currency;
  amount_received: number;

  // Details
  description?: string;
  reason?: string;

  // Links to original transactions
  original_po_id?: string;
  original_expense_id?: string;
  original_transaction_id?: string;

  // Dates
  expected_date?: string;
  created_date: string;
  received_date?: string;

  // Status
  status: ReceivableStatus;

  // When received
  received_to_account_id?: string;

  notes?: string;

  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================
// Customer Ledger (Deposits & Credits)
// ============================================

export type CustomerLedgerEntryType = 'deposit' | 'credit';
export type CustomerLedgerStatus = 'active' | 'partially_applied' | 'fully_applied' | 'refunded' | 'cancelled';
export type CreditReason = 'order_cancellation' | 'quality_issue' | 'goodwill' | 'overpayment' | 'other';

export interface CustomerLedgerEntry {
  id: string;
  reference_number?: string;

  customer_id?: string;
  customer_name?: string;

  entry_type: CustomerLedgerEntryType;
  credit_reason?: CreditReason;

  amount: number;
  currency: Currency;
  amount_applied: number;
  amount_refunded: number;

  status: CustomerLedgerStatus;

  source_order_id?: string;
  received_to_account_id?: string;
  refunded_from_account_id?: string;

  created_date: string;
  applied_date?: string;
  refunded_date?: string;

  description?: string;
  notes?: string;

  created_at: Timestamp;
  updated_at?: Timestamp;
}

export interface CustomerLedgerApplication {
  id: string;
  ledger_entry_id: string;
  order_id: string;
  amount_applied: number;
  applied_at: Timestamp;
  notes?: string;
}

// ============================================
// Personal Loans (Informal Loans & Employee Advances)
// ============================================

export type LoanType = 'informal_loan' | 'employee_advance';
export type LoanDirection = 'received' | 'given';
export type LoanStatus = 'active' | 'partially_repaid' | 'fully_repaid' | 'cancelled' | 'written_off';
export type AdvanceType = 'salary_advance' | 'expense_advance';

export interface PersonalLoan {
  id: string;
  reference_number?: string;

  loan_type: LoanType;

  party_name: string;
  party_phone?: string;
  party_email?: string;
  relationship?: string;

  advance_type?: AdvanceType;
  direction: LoanDirection;

  amount: number;
  currency: Currency;
  amount_repaid: number;

  status: LoanStatus;

  account_id?: string;

  loan_date: string;
  expected_repayment_date?: string;
  fully_repaid_date?: string;

  purpose?: string;
  notes?: string;

  created_at: Timestamp;
  updated_at?: Timestamp;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  currency: Currency;
  account_id?: string;
  repayment_date: string;
  method?: string;
  notes?: string;
  created_at: Timestamp;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  reference_id?: string; // Link to Expense or Order
  exchangeRate?: number; // Exchange rate at time of transaction
  amountEUR?: number; // Calculated amount in EUR
  date: Timestamp;
  created_at: Timestamp;
}

// ============================================
// Conversations (Concierge Inbox) - REMOVED per PRD (MVP uses internal data only)
// ============================================
// export type ConversationChannel = 'whatsapp' | 'instagram' | 'messenger';
// export type ConversationStatus = 'new' | 'pricing' | 'waiting_customer' | 'deposit' | 'sourcing' | 'won' | 'lost' | 'archived';

// export interface Conversation { ... } -> Removed
// export interface Message { ... } -> Removed

// ============================================
// Vendors & Purchasing
// ============================================


export interface Vendor {
  id: string;
  name: string;
  contact?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  // Financial Terms

  storeCredit: number;           // Amount vendor owes US (EUR) - Positive value
  discountPercent?: number;      // Special discount %
  // Meta
  notes?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
export type PurchaseType = 'store_purchase' | 'online_purchase';

export interface PurchaseOrderItem {
  id: string;
  productId?: string;
  name: string;                  // "On Running Cloudtilt - White - 42"
  quantity: number;
  unitCost: number;              // In PO currency
  total: number;                 // In PO currency
  linkedOrderItemId?: string;    // Reference to concierge order item
  linkedOrderId?: string;        // Reference to the order this item belongs to

  // Variant details
  size?: string;
  color?: string;
  sku?: string;

  // Item Level Discount
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;              // Auto: "PO-2026-0001"
  vendorId?: string;
  vendorName?: string;
  status: POStatus;
  paymentStatus?: 'unpaid' | 'paid' | 'partially_paid';
  purchaseType: PurchaseType;

  currency: Currency;            // PO currency (EUR, USD, LYD)
  items: PurchaseOrderItem[];
  subtotal: number;              // In PO currency
  discountPercent: number;
  discountAmount: number;        // In PO currency
  taxAmount?: number;            // In PO currency
  additionalCosts: number;       // e.g. Shipping
  total: number;                 // In PO currency

  linkedOrderIds: string[];      // Concierge orders this PO fulfills

  expectedDate?: Timestamp | string;
  receivedDate?: Timestamp | string;
  paidAt?: Timestamp | string;
  paidFromAccountId?: string;
  paymentExchangeRate?: number;  // Exchange rate used for cross-currency payment
  paymentAmountInAccountCurrency?: number; // Actual amount debited from account
  totalPaid: number;                       // Running total of payments in PO currency
  payments?: POPayment[];                  // Individual payment splits (loaded on detail page)
  notes?: string;
  receiptUrl?: string; // URL to receipt image (legacy single)
  receiptUrls: string[]; // URLs to receipt images

  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface POPayment {
  id: string;
  poId: string;
  accountId: string;
  accountName?: string;
  accountCurrency?: Currency;
  amount: number;
  exchangeRate?: number;
  amountInAccountCurrency: number;
  transactionId?: string;
  expenseId?: string;
  paidAt: string;
  notes?: string;
}

// ============================================
// System Logs (Logging & Auditing)
// ============================================
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type ActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'system_error'
  | 'payment_failure'
  | 'api_failure';

export interface SystemLog {
  id: string;
  timestamp: Timestamp;
  level: LogLevel;
  action: ActionType;
  
  // Actor (Who did it?)
  userId?: string;
  userEmail?: string;
  role?: UserRole; // Snapshot of role at time of action
  ipAddress?: string;
  userAgent?: string;

  // Context (What was affected?)
  resource: 'order' | 'product' | 'user' | 'customer' | 'system' | 'finance' | 'vendor' | 'inventory' | 'purchase_order' | 'analytics';
  resourceId?: string; 
  
  // Changes (Audit Trail)
  details: string; // Human readable summary
  metadata?: Record<string, unknown> & {
    oldValue?: unknown;
    newValue?: unknown;
    errorStack?: string;
    path?: string;
  };
}

// ============================================
// Loyalty (New)
// ============================================
export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  orderId?: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjustment';
  status: 'pending' | 'available' | 'cancelled';
  description?: string;
  availableAt?: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// Normalized Order Items (New)
// ============================================
export interface OrderItemTable {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  sku: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPriceEUR: number;
  unitCostEUR: number;
  totalPriceEUR: number;
  unitPriceLocal?: number;
  totalPriceLocal?: number;
  createdAt: Timestamp;
}

// ============================================
// Sourcing Requests ("dawwarli")
// ============================================
export type SourcingRequestStatus =
  | 'new'
  | 'reviewing'
  | 'quoted'
  | 'accepted'
  | 'paid'
  | 'ordered'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'not_available';

export type SourcingBudgetRange =
  | 'no_budget'
  | 'under_100'
  | '100_200'
  | '200_500'
  | '500_1000'
  | 'over_1000';

export interface SourcingRequest {
  id: string;
  requestNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  description?: string;
  productLink?: string;
  budgetRange?: SourcingBudgetRange;
  notes?: string;
  images: SourcingRequestImage[];
  status: SourcingRequestStatus;
  sourceUrl?: string;
  costPriceEur?: number;
  salePrice?: number;
  saleCurrency: 'EUR' | 'LYD';
  shippingEstimateEur?: number;
  shippingEstimateDays?: number;
  internalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  quotedAt?: Timestamp;
  completedAt?: Timestamp;
}

export interface SourcingRequestImage {
  id: string;
  requestId: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: Timestamp;
}

export interface SourcingNote {
  id: string;
  requestId: string;
  authorId?: string;
  authorName?: string;
  content: string;
  createdAt: Timestamp;
}

export interface SourcingQuote {
  id: string;
  requestId: string;
  costPriceEur: number;
  salePrice: number;
  saleCurrency: 'EUR' | 'LYD';
  shippingEstimateEur: number;
  marginPercent?: number;
  exchangeRate?: number;
  messageTemplate?: string;
  createdBy?: string;
  createdAt: Timestamp;
}

