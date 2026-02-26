# Internationalization (i18n) Guide

## Overview

The Elite mobile app now supports **English** and **Arabic** with full RTL (Right-to-Left) layout support. This guide explains how to use translations throughout the app.

---

## ✅ What's Implemented

### Infrastructure
- ✅ i18next + react-i18next setup
- ✅ English (en.json) and Arabic (ar.json) translation files
- ✅ AsyncStorage persistence for language preference
- ✅ Automatic RTL layout switching
- ✅ Language switcher component
- ✅ Settings screen for changing language

### Features
- Translations for all major screens
- Automatic app reload when switching between LTR/RTL
- Persisted language preference across app restarts
- Native device locale detection on first launch

---

## 📁 File Structure

```
src/
├── lib/i18n/
│   ├── index.ts          # i18n configuration
│   ├── en.json           # English translations
│   └── ar.json           # Arabic translations
├── store/
│   └── preferencesStore.ts  # Language state management
└── components/settings/
    └── LanguageSwitcher.tsx # Language switcher UI

app/
└── settings.tsx          # Settings screen
```

---

## 🚀 How to Use Translations

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('common.loading')}</Text>
      {/* Renders: "Loading..." in English or "جاري التحميل..." in Arabic */}
    </View>
  );
}
```

### With Variables

```tsx
const { t } = useTranslation();

// Order count example
<Text>{t('cart.item_count', { count: 3 })}</Text>
// Renders: "3 items" in English or "3 منتجات" in Arabic

// Next tier amount
<Text>{t('loyalty.unlock', { amount: 2500 })}</Text>
// Renders: "€2500 to unlock" in English or "€2500 للوصول" in Arabic
```

### Accessing Nested Keys

```tsx
const { t } = useTranslation();

<Text>{t('auth.login.title')}</Text>
// Renders: "Welcome Back" in English or "مرحباً بك" in Arabic

<Text>{t('orders.status.pending')}</Text>
// Renders: "Pending" in English or "قيد الانتظار" in Arabic
```

---

## 🎨 RTL Layout Support

### Automatic RTL Switching

When user selects Arabic, the app automatically:
1. Changes all text to Arabic
2. Applies RTL layout (elements flow from right to left)
3. Mirrors UI elements (icons, navigation)
4. Reloads app to apply layout changes

### RTL-Aware Styling

Use these patterns for RTL-compatible styles:

```tsx
// ❌ Bad - Fixed direction
style={{
  marginLeft: 16,
  paddingRight: 8,
}}

// ✅ Good - Direction-aware
style={{
  marginStart: 16,  // Becomes marginRight in RTL
  paddingEnd: 8,    // Becomes paddingLeft in RTL
}}
```

### FlexBox in RTL

```tsx
// Automatically reverses in RTL
<View style={{ flexDirection: 'row' }}>
  <Text>First</Text>
  <Text>Second</Text>
</View>

// LTR: [First] [Second]
// RTL: [Second] [First]
```

### Icons in RTL

```tsx
import { I18nManager } from 'react-native';

// Flip icons conditionally
<Ionicons 
  name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'} 
  size={24} 
/>
```

---

## 🔧 Changing Language

### From Settings Screen

1. User taps **"Language"** in Account menu
2. Opens Settings screen with language options
3. User selects English or Arabic
4. Alert confirms app will reload
5. App reloads with new language + RTL layout

### Programmatically

```tsx
import { usePreferencesStore } from '../store/preferencesStore';

function MyComponent() {
  const { language, setLanguage } = usePreferencesStore();

  const switchToArabic = async () => {
    await setLanguage('ar');
    // App will reload automatically
  };

  return (
    <Button onPress={switchToArabic} title="Switch to Arabic" />
  );
}
```

---

## 📝 Translation Keys Reference

### Common
- `common.loading` - Loading...
- `common.error` - Error message
- `common.continue` - Continue button
- `common.save` - Save button
- `common.cancel` - Cancel button

### Authentication
- `auth.login.title` - Login title
- `auth.login.email_label` - Email label
- `auth.login.password_label` - Password label
- `auth.login.submit` - Sign in button
- `auth.register.title` - Register title

### Products
- `products.title` - Products title
- `products.search_placeholder` - Search input
- `products.add_to_cart` - Add to cart button
- `products.out_of_stock` - Out of stock badge
- `products.delivery.immediate` - Immediate delivery

### Cart
- `cart.title` - Shopping cart
- `cart.empty` - Empty cart message
- `cart.total` - Total label
- `cart.proceed_to_checkout` - Checkout button

### Checkout
- `checkout.title` - Checkout title
- `checkout.full_name_label` - Full name input
- `checkout.phone_label` - Phone input
- `checkout.place_order` - Place order button
- `checkout.order_summary` - Order summary

### Orders
- `orders.title` - My orders
- `orders.empty` - No orders message
- `orders.status.pending` - Pending status
- `orders.status.delivered` - Delivered status
- `orders.view_details` - View details link

### Loyalty
- `loyalty.tier.classic` - Classic tier
- `loyalty.tier.prestige` - Prestige tier
- `loyalty.tier.black` - Black tier
- `loyalty.benefits.free_shipping` - Free shipping
- `loyalty.benefits.concierge` - Concierge service

See full list in `src/lib/i18n/en.json` and `ar.json`

---

## ✏️ Adding New Translations

### 1. Add to English File

Edit `src/lib/i18n/en.json`:

```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature",
    "action": "Try it now"
  }
}
```

### 2. Add to Arabic File

Edit `src/lib/i18n/ar.json`:

```json
{
  "newFeature": {
    "title": "ميزة جديدة",
    "description": "هذه ميزة جديدة",
    "action": "جربها الآن"
  }
}
```

### 3. Use in Component

```tsx
const { t } = useTranslation();

<View>
  <Text>{t('newFeature.title')}</Text>
  <Text>{t('newFeature.description')}</Text>
  <Button title={t('newFeature.action')} />
</View>
```

---

## 🧪 Testing

### Test Language Switching

1. Open app in English
2. Go to Account → Language
3. Select Arabic
4. Confirm reload
5. App should restart in Arabic with RTL layout
6. Verify:
   - All text is in Arabic
   - Layout flows right-to-left
   - Icons are mirrored
   - Navigation is reversed

### Test RTL Layout

```bash
# Force RTL in development
# Add to app.json:
{
  "expo": {
    "extra": {
      "supportsRTL": true
    }
  }
}
```

---

## 🎯 Next Steps to Complete i18n

### 1. Update All Screens with useTranslation

Currently hardcoded text needs to be replaced:

**Auth Screens:**
- [ ] `app/(auth)/login.tsx`
- [ ] `app/(auth)/register.tsx`

**Product Screens:**
- [ ] `app/(tabs)/index.tsx` (Home)
- [ ] `app/product/[id].tsx` (Product detail)

**Cart & Checkout:**
- [ ] `app/(tabs)/cart.tsx`
- [ ] `app/checkout/index.tsx`
- [ ] `app/order-success.tsx`

**Orders:**
- [ ] `app/orders/index.tsx`
- [ ] `app/orders/[id].tsx`

**Account:**
- [ ] `app/(tabs)/account.tsx`

**Components:**
- [ ] `src/components/loyalty/LoyaltyCard.tsx`
- [ ] `src/components/product/ProductCard.tsx`

### Example Migration

**Before:**
```tsx
<Text style={styles.title}>Shopping Cart</Text>
<Button title="Proceed to Checkout" />
```

**After:**
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Text style={styles.title}>{t('cart.title')}</Text>
<Button title={t('cart.proceed_to_checkout')} />
```

### 2. Test All Screens in Both Languages

Go through each screen and verify:
- All text displays correctly in Arabic
- RTL layout doesn't break UI
- Forms work with Arabic input
- Dates/numbers format correctly

### 3. Add More Translations as Needed

Some screens may need additional keys not in the current translation files. Add them following the pattern above.

---

## 🐛 Troubleshooting

### App doesn't reload after language change

**Solution:** Make sure `expo-updates` is installed:
```bash
npx expo install expo-updates
```

### RTL layout is broken

**Solution:** Use `marginStart`/`marginEnd` instead of `marginLeft`/`marginRight` in all styles.

### Translation key not found

**Solution:** Check that the key exists in both `en.json` and `ar.json` files. Keys are case-sensitive.

### Arabic text displays incorrectly

**Solution:** Ensure Alexandria font (or another Arabic-supporting font) is loaded in `app.json`:
```json
{
  "expo": {
    "fonts": [
      "path/to/Alexandria-Regular.ttf"
    ]
  }
}
```

---

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [React Native RTL Support](https://reactnative.dev/blog/2016/08/19/right-to-left-support-for-react-native-apps)

---

## ✅ Summary

**What's Working:**
- ✅ Translation infrastructure setup
- ✅ English & Arabic translations created
- ✅ Language switcher with reload
- ✅ RTL layout switching
- ✅ Persistent language preference

**What's Needed:**
- [ ] Replace hardcoded strings with `t()` calls in all screens
- [ ] Test all screens in both languages
- [ ] Fix any RTL layout issues
- [ ] Add missing translation keys

**Total Effort:** ~2-3 hours to migrate all screens

**Next Priority:** Update login/register screens as examples, then proceed with other screens systematically.
