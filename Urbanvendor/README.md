# UrbanVendor Dashboard - React Native

A comprehensive vendor dashboard mobile application built with React Native and Expo, inspired by the MultimallPro vendor dashboard.

## Features

- **Dashboard Overview** - Sales analytics and key metrics
- **Order Management** - Track and manage customer orders
- **Product Management** - Add, edit, and organize products
- **Customer Management** - View customer information and history
- **Category Management** - Organize products by categories
- **Analytics** - Sales performance and business insights
- **Settings & Integrations** - App configuration and third-party connections

## Tech Stack

- **React Native 0.76.3** with **Expo SDK 54**
- **React Navigation 7** for navigation
- **React Native Paper 5.12** for UI components
- **React Native Chart Kit** for analytics charts
- **Expo Vector Icons** for iconography
- **Async Storage** for local data persistence

## Installation

1. **Prerequisites:**
   - Node.js 18+ 
   - Expo CLI: `npm install -g @expo/cli`
   - For iOS: Xcode (Mac only)
   - For Android: Android Studio

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
# or
npx expo start
```

4. **Run on device/simulator:**
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For Web
```

5. **Scan QR code** with Expo Go app on your phone or use simulator

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── theme/              # App theme configuration
└── utils/              # Utility functions
```

## Key Components

### Navigation
- Drawer navigation with all main sections
- Custom drawer content with user profile
- Material Design icons throughout

### Screens
- **DashboardScreen** - Main overview with charts and stats
- **ProductsScreen** - Product management with search and filters
- **OrdersScreen** - Order tracking and status management
- **CustomersScreen** - Customer information display
- **AnalyticsScreen** - Business performance charts

### Features
- Empty states for new vendors
- Search and filter functionality
- Responsive design for different screen sizes
- Material Design 3 theming

## Customization

### Theme
Edit `src/theme/theme.js` to customize colors and styling.

### Adding Features
1. Create new screen in `src/screens/`
2. Add navigation route in `App.js`
3. Update drawer navigation in `CustomDrawerContent.js`

## Backend Integration

This app is designed to work with REST APIs. Key integration points:

- Product CRUD operations
- Order management
- Customer data
- Analytics data
- Authentication

## Deployment

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details.
