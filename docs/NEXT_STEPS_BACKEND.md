# Next Steps: Backend API Development

## 🎯 Priority: Backend API Endpoints

The mobile app is ready, but it needs these 3 backend API endpoints to be fully functional.

**Estimated Time:** 2 hours
**Priority:** CRITICAL - Blocking mobile app testing

---

## 📋 Required Endpoints

### 1. Create Order Endpoint
**Route:** `POST /api/orders`
**Priority:** CRITICAL
**Time:** ~45 minutes

### 2. Validate Coupon Endpoint
**Route:** `POST /api/coupons/validate`
**Priority:** HIGH
**Time:** ~30 minutes

### 3. Get Cities Endpoint
**Route:** `GET /api/shipping/cities`
**Priority:** HIGH
**Time:** ~30 minutes

---

## 1️⃣ Create Order Endpoint

### What It Does
Receives order data from mobile app and creates a new order in Supabase.

### Route Details
```typescript
POST /api/orders
Content-Type: application/json
```

### Request Body
```typescript
{
  // Customer Info
  fullName: string;
  phone: string;
  city: string;
  address?: string;
  customerId?: string;

  // Order Items
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    size: string;
    color: string;
    isConcierge: boolean;
  }>;

  // Pricing
  totalEur: number;
  shippingFee: number;
  depositAmount?: number;
  couponCode?: string;
}
```

### Response
```typescript
// Success
{
  success: true;
  orderNumber: "ES-20260225-001";
  orderId: "uuid-string";
  message: "Order placed successfully"
}

// Error
{
  success: false;
  error: "Error message"
}
```

### Implementation Steps

#### Step 1: Create API File
**Location:** `apps/admin/src/app/api/orders/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();

    // Validate required fields
    if (!body.fullName || !body.phone || !body.city || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: body.customerId || null,
        status: 'pending',
        total_eur: body.totalEur,
        shipping_fee: body.shippingFee,
        deposit_amount: body.depositAmount || 0,
        discount_amount: 0, // Calculate if coupon applied
        coupon_code: body.couponCode || null,
        shipping_address: {
          fullName: body.fullName,
          phone: body.phone,
          city: body.city,
          address: body.address || '',
        },
        payment_method: 'COD',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = body.items.map((item: any) => ({
      order_id: order.id,
      product_variant_id: item.variantId,
      quantity: item.quantity,
      price_eur: item.price,
      product_name: item.name,
      image_url: item.image,
      size: item.size,
      color: item.color,
      is_concierge: item.isConcierge || false,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Return success
    return NextResponse.json({
      success: true,
      orderNumber: orderNumber,
      orderId: order.id,
      message: 'Order placed successfully',
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Helper function to generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `ES-${year}${month}${day}-${random}`;
}
```

#### Step 2: Test Endpoint

**Using Thunder Client / Postman:**
```json
POST http://localhost:3000/api/orders

{
  "fullName": "Test User",
  "phone": "+218912345678",
  "city": "Tripoli",
  "address": "Test Address",
  "customerId": null,
  "items": [
    {
      "variantId": "test-variant-1",
      "quantity": 1,
      "price": 99.99,
      "name": "Test Product",
      "image": "https://example.com/image.jpg",
      "size": "M",
      "color": "Black",
      "isConcierge": false
    }
  ],
  "totalEur": 109.99,
  "shippingFee": 10.00,
  "depositAmount": 0,
  "couponCode": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "orderNumber": "ES-20260225-123",
  "orderId": "uuid-here",
  "message": "Order placed successfully"
}
```

#### Step 3: Update Mobile App

The mobile app already calls this endpoint at:
- **File:** `src/api/endpoints/checkout.ts`
- **Function:** `placeOrder()`

Verify the endpoint URL is correct:
```typescript
const response = await fetch(`${process.env.EXPO_PUBLIC_APP_URL}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
});
```

---

## 2️⃣ Validate Coupon Endpoint

### What It Does
Checks if a coupon code is valid and returns discount information.

### Route Details
```typescript
POST /api/coupons/validate
Content-Type: application/json
```

### Request Body
```typescript
{
  code: string;        // Coupon code to validate
  orderTotal: number;  // Current cart total in EUR
}
```

### Response
```typescript
// Valid Coupon
{
  valid: true;
  discount: {
    code: "SUMMER20";
    type: "percentage" | "fixed";
    value: 20;  // 20% or €20
    description: "Summer Sale - 20% off";
  }
}

// Invalid Coupon
{
  valid: false;
  error: "Coupon not found" | "Coupon expired" | "Minimum order not met"
}
```

### Implementation Steps

#### Step 1: Create API File
**Location:** `apps/admin/src/app/api/coupons/validate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch coupon from database
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon not found or inactive',
      });
    }

    // Check expiration date
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired',
      });
    }

    // Check minimum order amount
    if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is €${coupon.min_order_amount}`,
      });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon usage limit reached',
      });
    }

    // Return valid coupon
    return NextResponse.json({
      valid: true,
      discount: {
        code: coupon.code,
        type: coupon.discount_type, // 'percentage' or 'fixed'
        value: coupon.discount_value,
        description: coupon.description,
      },
    });

  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
```

#### Step 2: Create Coupons Table (if not exists)

**Run in Supabase SQL Editor:**
```sql
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 0, true),
  ('SUMMER20', 'Summer sale - 20% off', 'percentage', 20, 50, true),
  ('FREESHIP', 'Free shipping', 'fixed', 10, 30, true);
```

#### Step 3: Test Endpoint

```json
POST http://localhost:3000/api/coupons/validate

{
  "code": "WELCOME10",
  "orderTotal": 100
}
```

**Expected Response:**
```json
{
  "valid": true,
  "discount": {
    "code": "WELCOME10",
    "type": "percentage",
    "value": 10,
    "description": "Welcome discount - 10% off"
  }
}
```

---

## 3️⃣ Get Cities Endpoint

### What It Does
Returns list of cities with shipping fees.

### Route Details
```typescript
GET /api/shipping/cities
```

### Response
```typescript
[
  {
    id: "uuid-1";
    city_name: "Tripoli";
    fee_local: 10.00;
    fee_international: 0;
    is_active: true;
  },
  {
    id: "uuid-2";
    city_name: "Benghazi";
    fee_local: 15.00;
    fee_international: 0;
    is_active: true;
  }
]
```

### Implementation Steps

#### Step 1: Create API File
**Location:** `apps/admin/src/app/api/shipping/cities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch active cities
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('city_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(cities || []);

  } catch (error: any) {
    console.error('Get cities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
```

#### Step 2: Verify Cities Table Exists

**Check in Supabase:**
```sql
SELECT * FROM cities WHERE is_active = true;
```

If table doesn't exist, it should already be created from the admin app. If not:
```sql
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  fee_local DECIMAL(10, 2) DEFAULT 10.00,
  fee_international DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert major Libyan cities
INSERT INTO cities (city_name, fee_local, is_active)
VALUES
  ('Tripoli', 10.00, true),
  ('Benghazi', 15.00, true),
  ('Misrata', 12.00, true),
  ('Zawiya', 10.00, true),
  ('Khoms', 12.00, true);
```

#### Step 3: Test Endpoint

```bash
GET http://localhost:3000/api/shipping/cities
```

**Expected Response:**
```json
[
  {
    "id": "uuid-1",
    "city_name": "Tripoli",
    "fee_local": 10.00,
    "fee_international": 0,
    "is_active": true,
    "created_at": "2026-02-25T10:00:00Z"
  },
  {
    "id": "uuid-2",
    "city_name": "Benghazi",
    "fee_local": 15.00,
    "fee_international": 0,
    "is_active": true,
    "created_at": "2026-02-25T10:00:00Z"
  }
]
```

---

## 🧪 Testing All Endpoints Together

### Complete Order Flow Test

**Step 1: Get Cities**
```bash
GET /api/shipping/cities
```

**Step 2: Validate Coupon (Optional)**
```json
POST /api/coupons/validate

{
  "code": "WELCOME10",
  "orderTotal": 100
}
```

**Step 3: Create Order**
```json
POST /api/orders

{
  "fullName": "John Doe",
  "phone": "+218912345678",
  "city": "Tripoli",
  "address": "Test Street, Building 5",
  "items": [
    {
      "variantId": "prod-1-black-m",
      "quantity": 2,
      "price": 50,
      "name": "Designer Shirt",
      "size": "M",
      "color": "Black",
      "isConcierge": false
    }
  ],
  "totalEur": 110,
  "shippingFee": 10,
  "couponCode": "WELCOME10"
}
```

**Step 4: Verify in Supabase**
```sql
-- Check order was created
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Check order items
SELECT * FROM order_items WHERE order_id = 'your-order-id';
```

---

## 🚀 Deployment Steps

### 1. Push to Git
```bash
cd apps/admin
git add .
git commit -m "Add mobile API endpoints: orders, coupons, cities"
git push origin main
```

### 2. Deploy to Production

If using Vercel:
```bash
vercel --prod
```

Or if auto-deploy is enabled, deployment will happen automatically after push.

### 3. Update Mobile App Environment

Update `.env` in mobile app:
```env
EXPO_PUBLIC_APP_URL=https://your-admin-domain.com
```

### 4. Test Production Endpoints

Test each endpoint on production:
```bash
# Cities
curl https://your-admin-domain.com/api/shipping/cities

# Coupons
curl -X POST https://your-admin-domain.com/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","orderTotal":100}'

# Orders (test with mobile app)
```

---

## 📝 Mobile App Integration Verification

### Files to Check

**1. Checkout Endpoint** (`src/api/endpoints/checkout.ts`)
```typescript
// Verify these functions exist:
- getCities()
- validateCoupon()
- placeOrder()
```

**2. Environment Variables** (`.env`)
```
EXPO_PUBLIC_APP_URL=your-backend-url
```

**3. Test in Mobile App**
```bash
npm start
# Open app
# Go to checkout
# Verify cities load
# Apply coupon
# Place order
```

---

## ✅ Completion Checklist

- [ ] Created POST /api/orders endpoint
- [ ] Created POST /api/coupons/validate endpoint
- [ ] Created GET /api/shipping/cities endpoint
- [ ] Created/verified coupons table
- [ ] Created/verified cities table
- [ ] Tested all endpoints locally
- [ ] Deployed to production
- [ ] Updated mobile app environment variables
- [ ] Tested complete order flow in mobile app
- [ ] Verified orders appear in Supabase
- [ ] Verified order items are created
- [ ] Tested coupon validation
- [ ] Tested city selection

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
Add to API route:
```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### Issue 2: Supabase Client Error
**Error:** "Failed to create Supabase client"

**Solution:**
Verify environment variables in admin app:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Issue 3: Order Number Collision
**Error:** "Duplicate order number"

**Solution:**
Add more randomness to order number generation:
```typescript
const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
```

---

## 📊 After Completion

Once all APIs are working:

1. **✅ Mark Backend APIs as Complete**
2. **🧪 Run Full E2E Testing** (2 hours)
   - Test all flows in both languages
   - Test on physical devices
   - Verify all edge cases
3. **📱 App Store Preparation** (1 hour)
   - Create icons
   - Take screenshots
   - Write descriptions
4. **🚀 Launch!**

---

**Estimated Total Time:** 2 hours
**Current Status:** Waiting to start
**Next Action:** Create POST /api/orders endpoint

Good luck! Let me know if you need any clarification on these implementations. 🚀
