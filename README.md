# 🏙️ Urbanprox - Home Services Marketplace

Urbanprox is a complete marketplace connecting users with local service providers. It includes a user app, an admin dashboard, and a vendor management application.

## 📁 Project Structure

This repository is organized as a monorepo containing all components:

- **[`Adminurban/`](./Adminurban)**: The Super Admin Dashboard (React/Expo Web).
- **[`userurban/`](./userurban)**: The Customer User App (React Native/Expo).
- **[`Urbanvendor/`](./Urbanvendor)**: 
  - **Front-end**: Service Provider/Vendor Dashboard (React Native Web).
  - **[`backend/`](./Urbanvendor/backend)**: Core Node.js/Express API & Socket.io server.

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Firebase Project
- Expo CLI (`npm install -g expo-cli`)

### 2. Backend Setup
```bash
cd Urbanvendor/backend
npm install
# Create .env with MONGODB_URI, JWT_SECRET, PORT=5004, FIREBASE_PROJECT_ID
npm run dev
```

### 3. Frontends Setup
Each frontend requires the `EXPO_PUBLIC_API_URL` environment variable.

**Admin:**
```bash
cd Adminurban
npm install
npx expo start --web
```

**User:**
```bash
cd userurban
npm install
npx expo start --web
```

**Vendor:**
```bash
cd Urbanvendor
npm install
npx expo start --web
```

---

## 🌐 Live Deployment
The platform is currently deployed at:
- **Main Website**: [https://urbanprox.com](https://urbanprox.com)
- **Admin**: [https://admin.urbanprox.com](https://admin.urbanprox.com)
- **Vendor**: [https://vendor.urbanprox.com](https://vendor.urbanprox.com)
- **API**: [https://api.urbanprox.com](https://api.urbanprox.com)

See [DEPLOYMENT_VPS.md](./DEPLOYMENT_VPS.md) for server-side configuration.

---



---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Firebase Admin SDK.
- **Frontend:** React Native (Expo), React, Tailwind CSS (Design tokens).
- **Hosting:** Hostinger VPS (Ubuntu), Nginx, PM2, Certbot (SSL).

---

## 📜 License
© 2026 Urbanprox. All rights reserved.
