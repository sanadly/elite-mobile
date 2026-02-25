# Testing Guide - Orders & Loyalty Features

## Overview
This guide covers testing the newly implemented Orders and Loyalty features.

---

## 🧪 Testing Orders Feature

### 1. Orders List Screen

**Navigation:**
```
Account Tab → "My Orders" menu item → Orders List
```

**What to Test:**
- [ ] Empty state appears if no orders exist
- [ ] Order cards display correctly with:
  - Order number (e.g., #ORD-2024-0001)
  - Order date and time
  - Status badge with correct color
  - City/shipping info
  - Payment method (COD)
  - Total amount
  - "View Details" link
- [ ] Pull-to-refresh works
- [ ] Tapping order card navigates to detail screen
- [ ] Status colors match:
  - Pending: Blue/gray
  - Confirmed: Light blue
  - Processing: Amber/yellow
  - Shipped: Purple
  - Delivered: Green
  - Cancelled: Red

### 2. Order Detail Screen

**Navigation:**
```
Orders List → Tap any order card
```

**What to Test:**
- [ ] Back button works
- [ ] Order number and date display at top
- [ ] Status Timeline shows correctly:
  - Icons for each status
  - Completed statuses have filled icons
  - Current status is highlighted
  - Timeline line connects stages
  - Completed segments are colored
- [ ] Shipping information displays:
  - Full name
  - Phone number
  - City and address
- [ ] Order items show:
  - Product image (or placeholder)
  - Product name
  - Color and size
  - Quantity
  - Price per item
- [ ] Order summary calculates correctly:
  - Subtotal
  - Discount (if applied)
  - Shipping fee
  - Total
  - Deposit amount (for concierge items)
  - Payment method (COD)

### 3. Real-time Updates

**What to Test:**
- [ ] When order status changes in backend, it updates in app
- [ ] Orders list refreshes automatically
- [ ] Order detail updates without manual refresh
- [ ] Status badge color changes reflect new status

---

## 🏆 Testing Loyalty Features

### 1. Loyalty Card Display

**Navigation:**
```
Account Tab → Scroll to see Loyalty Card
```

**What to Test:**

#### Visual Elements:
- [ ] Tier badge shows current tier (Classic/Prestige/Black)
- [ ] Badge color matches tier:
  - Classic: Gray (#94A3B8)
  - Prestige: Gold (#F59E0B)
  - Black: Deep black (#0F172A)
- [ ] Icon matches tier:
  - Classic: Star outline
  - Prestige: Filled star
  - Black: Diamond

#### Progress Ring:
- [ ] Circular progress ring displays
- [ ] Ring animates smoothly on load (1 second duration)
- [ ] Percentage in center updates
- [ ] Ring color matches tier color
- [ ] Progress percentage is accurate

#### Tier Information:
- [ ] Current spend displays (€XXX)
- [ ] For Classic/Prestige tiers:
  - Shows "Next Tier" section
  - Displays next tier name with icon
  - Shows "€XXX to unlock" amount
- [ ] For Black tier:
  - Shows "Maximum Tier Achieved!" message
  - Trophy icon displays

#### Benefits List:
- [ ] Free Shipping:
  - ❌ Classic: Red X, strikethrough
  - ✅ Prestige/Black: Green checkmark
- [ ] Concierge Service:
  - ❌ Classic: Red X, strikethrough
  - ✅ Prestige/Black: Green checkmark
- [ ] Deposit rates display correctly:
  - Classic: "50% Deposit"
  - Prestige: "30% Deposit"
  - Black: "No Deposit Required"
- [ ] Black tier shows "Priority Support" benefit

### 2. Loyalty Calculations

**Test Scenarios:**

#### Classic Tier (€0 - €2,999):
```
Total Spend: €500
Expected:
- Tier: Classic
- Progress: 16.67% (500/3000)
- Next Tier: Prestige
- Amount to unlock: €2,500
- Benefits: 50% deposit only
```

#### Prestige Tier (€3,000 - €9,999):
```
Total Spend: €5,000
Expected:
- Tier: Prestige
- Progress: 50% (5000/10000)
- Next Tier: Black
- Amount to unlock: €5,000
- Benefits: Free shipping, concierge, 30% deposit
```

#### Black Tier (€10,000+):
```
Total Spend: €15,000
Expected:
- Tier: Black
- Progress: 100%
- Next Tier: None (max tier)
- Amount to unlock: N/A
- Benefits: All benefits, 0% deposit
```

---

## 🔄 Integration Testing

### Complete Order Flow:
1. [ ] Browse products
2. [ ] Add items to cart
3. [ ] Proceed to checkout
4. [ ] Fill shipping info
5. [ ] Place order (creates order in Supabase)
6. [ ] See order success screen
7. [ ] Navigate to "My Orders"
8. [ ] See new order in list
9. [ ] Tap to view order detail
10. [ ] Verify all information matches

### Loyalty Updates:
1. [ ] Place order (increases total spend)
2. [ ] Go to Account tab
3. [ ] Verify loyalty card updates
4. [ ] Check if tier upgraded
5. [ ] Verify progress ring animates to new percentage

---

## 🐛 Known Limitations (To Be Implemented)

### Backend API Endpoints Needed:
- `POST /api/orders` - Currently returns mock success
- Order data needs to be saved to Supabase `orders` table
- Order items need to be saved to `order_items` table
- Real-time subscriptions need actual Supabase channel setup

### Test Data:
- You may need to manually insert test orders in Supabase to test order list/detail screens
- User's `totalSpend` field in `users` table should be updated after orders

---

## 🧩 Manual Test Data Setup (If Needed)

### Create Test Orders in Supabase:

```sql
-- Insert test order
INSERT INTO orders (
  order_number,
  customer_id,
  status,
  total_eur,
  shipping_fee,
  shipping_address,
  payment_method,
  created_at,
  status_history
) VALUES (
  'ORD-2024-0001',
  '[your-user-id]',
  'delivered',
  150.00,
  5.00,
  '{"fullName": "John Doe", "phone": "+218912345678", "city": "Tripoli", "address": "Street 123"}',
  'cod',
  NOW() - INTERVAL '5 days',
  '{
    "pending": "2024-01-20T10:00:00Z",
    "confirmed": "2024-01-20T11:00:00Z",
    "processing": "2024-01-21T09:00:00Z",
    "shipped": "2024-01-22T14:00:00Z",
    "delivered": "2024-01-24T16:00:00Z"
  }'
);

-- Insert order items
INSERT INTO order_items (
  order_id,
  product_id,
  variant_id,
  product_name,
  color,
  size,
  quantity,
  price_eur,
  image_url
) VALUES (
  '[order-id-from-above]',
  '[product-id]',
  '[variant-id]',
  'Nike Air Max 270',
  'Black',
  '42',
  1,
  145.00,
  'https://example.com/image.jpg'
);

-- Update user total spend
UPDATE users
SET total_spend = 150.00
WHERE id = '[your-user-id]';
```

---

## ✅ Checklist Summary

### Orders Feature:
- [ ] Orders list displays with correct data
- [ ] Empty state shows when no orders
- [ ] Order cards are tappable
- [ ] Order detail shows complete information
- [ ] Status timeline renders correctly
- [ ] Pull-to-refresh works
- [ ] Real-time updates work (when implemented)

### Loyalty Feature:
- [ ] Loyalty card displays on account screen
- [ ] Tier badge shows correct tier
- [ ] Progress ring animates smoothly
- [ ] Progress percentage is accurate
- [ ] Benefits list matches tier
- [ ] "Next tier" section displays (Classic/Prestige)
- [ ] Max tier message shows (Black)
- [ ] Colors match design system

### Integration:
- [ ] Order placement creates order record
- [ ] Orders appear in orders list
- [ ] Loyalty updates after order
- [ ] Navigation flows work smoothly
- [ ] All screens match website design

---

## 🚨 Report Issues

When testing, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Screenshots (if applicable)
5. Device/simulator used

---

## 📸 Screenshots to Capture

For documentation, capture:
1. Orders list (with orders)
2. Orders list (empty state)
3. Order detail (each status)
4. Loyalty card (each tier)
5. Progress ring animation (video)
6. Complete order flow (multiple screens)

---

**Happy Testing! 🎉**
