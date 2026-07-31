# Adminurban - Urban Services Admin Panel

## Overview
This is the admin panel for the Urban Services platform. It supports both Web and Mobile (Android/iOS) using React Native Expo.

## Features
- **Authentication**: Email/Password login (Direct Backend Auth, No Firebase)
- **Dashboard**: Real-time statistics
- **User Management**: View, Block/Unblock users
- **Vendor Management**: Approve/Reject, Block/Unblock vendors
- **Booking Management**: View and manage bookings

## Getting Started

### Prerequisites
- Node.js
- Backend server running on port 3000

### Installation
```bash
npm install
```

### Running the App
- **Web**: `npm run web`
- **Android**: `npm run android`
- **iOS**: `npm run ios`

## Default Credentials
- **Email**: `admin@urban.com`
- **Password**: `password123`

## Project Structure
- `src/auth`: Authentication context and logic
- `src/components`: Reusable UI components
- `src/navigation`: App navigation (Stack Navigator)
- `src/screens`: App screens (Login, Dashboard, etc.)
- `src/services`: API client and services
- `src/theme`: Theme tokens (Colors, Typography)

## Backend Integration
The app connects to the backend at `http://localhost:3000/api` (Web) or `http://10.0.2.2:3000/api` (Android Emulator).
Authentication uses JWT tokens stored in AsyncStorage.
