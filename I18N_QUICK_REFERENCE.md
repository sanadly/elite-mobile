# i18n Quick Reference Card

Quick copy-paste reference for migrating screens to use translations.

---

## 🚀 Basic Setup (Add to every screen)

```tsx
// 1. Import
import { useTranslation } from 'react-i18next';

// 2. Get t function in component
export default function MyScreen() {
  const { t } = useTranslation();
  
  // ... rest of component
}
```

---

## 📝 Common Patterns

### Simple Text
```tsx
// Before:
<Text>Loading...</Text>

// After:
<Text>{t('common.loading')}</Text>
```

### Button Titles
```tsx
// Before:
<Button title="Continue Shopping" />

// After:
<Button title={t('cart.continue_shopping')} />
```

### Input Labels & Placeholders
```tsx
// Before:
<Input 
  label="Full Name"
  placeholder="Enter your full name"
/>

// After:
<Input 
  label={t('checkout.full_name_label')}
  placeholder={t('checkout.full_name_placeholder')}
/>
```

### With Variables
```tsx
// Before:
<Text>Total ({cartCount} items)</Text>

// After:
<Text>{t('cart.total')} ({t('cart.item_count', { count: cartCount })})</Text>
```

### Conditional Loading State
```tsx
// Before:
<Button title={loading ? "Signing in..." : "Sign In"} />

// After:
<Button title={loading ? t('auth.login.loading') : t('auth.login.submit')} />
```

---

## 🗂️ Translation Key Map

### Common UI
```tsx
t('common.loading')          // "Loading..."
t('common.error')            // "Something went wrong"
t('common.continue')         // "Continue"
t('common.save')             // "Save"
t('common.cancel')           // "Cancel"
```

### Auth
```tsx
t('auth.login.title')                  // "Welcome Back"
t('auth.login.email_label')            // "Email"
t('auth.login.password_label')         // "Password"
t('auth.login.submit')                 // "Sign In"
t('auth.register.title')               // "Create Account"
```

### Products
```tsx
t('products.title')                    // "Shop"
t('products.search_placeholder')       // "Search products..."
t('products.add_to_cart')              // "Add to Cart"
t('products.out_of_stock')             // "Out of Stock"
t('products.delivery.immediate')       // "Immediate Delivery"
```

### Cart
```tsx
t('cart.title')                        // "Shopping Cart"
t('cart.empty')                        // "Your cart is empty"
t('cart.total')                        // "Total"
t('cart.proceed_to_checkout')          // "Proceed to Checkout"
t('cart.item_count', { count: 3 })     // "3 items"
```

### Checkout
```tsx
t('checkout.title')                    // "Checkout"
t('checkout.full_name_label')          // "Full Name"
t('checkout.phone_label')              // "Phone Number"
t('checkout.place_order')              // "Place Order"
t('checkout.order_summary')            // "Order Summary"
```

### Orders
```tsx
t('orders.title')                      // "My Orders"
t('orders.empty')                      // "No Orders Yet"
t('orders.status.pending')             // "Pending"
t('orders.status.delivered')           // "Delivered"
t('orders.view_details')               // "View Details"
```

### Loyalty
```tsx
t('loyalty.tier.classic')              // "Classic"
t('loyalty.tier.prestige')             // "Prestige"
t('loyalty.total_spend')               // "Total Spend"
t('loyalty.benefits.free_shipping')    // "Free Shipping"
```

---

## ✅ Screen Migration Checklist

For each screen:

1. [ ] Add `import { useTranslation } from 'react-i18next';`
2. [ ] Add `const { t } = useTranslation();` in component
3. [ ] Replace all hardcoded text with `t('key')`
4. [ ] Test in English
5. [ ] Switch to Arabic in settings
6. [ ] Test in Arabic
7. [ ] Verify RTL layout looks good
8. [ ] Check for any remaining hardcoded strings

---

## 🎯 Priority Order for Migration

### Do First (High Visibility)
1. ✅ `app/(auth)/login.tsx` - **DONE**
2. `app/(auth)/register.tsx`
3. `app/(tabs)/cart.tsx`
4. `app/checkout/index.tsx`

### Do Next (Customer-Facing)
5. `app/orders/index.tsx`
6. `app/orders/[id].tsx`
7. `app/order-success.tsx`
8. `app/(tabs)/account.tsx`

### Do Last (Lower Priority)
9. `app/(tabs)/index.tsx` (Home)
10. `app/product/[id].tsx`
11. `src/components/loyalty/LoyaltyCard.tsx`
12. `src/components/product/ProductCard.tsx`

---

## 🐛 Common Issues & Fixes

### Issue: Key not found
**Error:** `i18next::translator: missingKey en translation myKey`
**Fix:** Add the key to both `en.json` and `ar.json`

### Issue: Translation doesn't update
**Fix:** Restart Metro bundler: `npx expo start --clear`

### Issue: RTL layout broken
**Fix:** Replace all `marginLeft/Right` with `marginStart/End`

### Issue: Text overflows in Arabic
**Fix:** Arabic text is often longer. Test with actual text, not Lorem Ipsum

---

## 📖 Full Documentation

- **Complete Guide:** `I18N_GUIDE.md`
- **Implementation Status:** `I18N_IMPLEMENTATION_SUMMARY.md`
- **Translation Files:** `src/lib/i18n/en.json` and `ar.json`

---

## 🚀 Quick Test

After migrating a screen:

```bash
# 1. Start app
npx expo start

# 2. In app:
#    - Go to Account → Language
#    - Switch to Arabic
#    - Confirm reload
#    - Navigate to your migrated screen
#    - Verify all text is in Arabic
#    - Check layout flows right-to-left
```

---

**Time per screen: ~15-20 minutes**
**Total remaining: ~3-4 hours for all screens**
