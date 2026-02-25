# Elite Style Mobile App 📱

React Native (Expo) mobile application for Elite Style luxury e-commerce.

## 🎨 Brand Identity

- **Primary Color**: #012856 (Navy Blue)
- **Font**: Alexandria (Arabic + English support)
- **Design**: Luxury/Premium aesthetic

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📁 Project Structure

```
elite-mobile/
├── app/                    # Expo Router screens
├── src/
│   ├── theme/             # Design system (colors, typography, spacing)
│   ├── store/             # Zustand stores (cart, auth)
│   ├── api/               # Supabase client
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (loyalty, i18n)
│   └── types/             # TypeScript types
└── assets/                # Images, fonts, logos
```

## 🔑 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## ✅ Completed

- [x] Expo project initialized
- [x] Design system migrated from web app
- [x] Brand assets (logos) copied
- [x] Folder structure created
- [x] Zustand cart store with AsyncStorage persistence
- [x] Supabase client configuration
- [x] Type definitions copied from web app
- [x] Loyalty logic migrated

## 🎯 Next Steps

1. Create base UI components (Button, Input, Card)
2. Set up authentication screens
3. Build product listing screens
4. Implement checkout flow
5. Add order management
6. Implement loyalty display

## 📦 Key Dependencies

- **expo-router**: File-based navigation
- **zustand**: State management
- **@tanstack/react-query**: Server state
- **@supabase/supabase-js**: Backend integration
- **@react-native-async-storage/async-storage**: Persistent storage
- **react-hook-form + zod**: Forms & validation

## 🌍 Multi-language Support

- Arabic (RTL) ✅
- English (LTR) ✅

## 📱 Target Platforms

- iOS App Store
- Android Play Store

---

Built with ❤️ for Elite Style (إيليت ستايل)
