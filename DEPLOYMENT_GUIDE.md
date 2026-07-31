# 🚀 Complete Deployment Guide - Urbanprox Platform

## Overview
You will deploy:
1. **Backend** → Railway (Node.js API)
2. **Admin Web** → Vercel (React/Expo Web)
3. **Vendor Web** → Vercel (React Native Web)
4. **User Web** → Vercel (React Native Web)

---

## 1️⃣ DEPLOY BACKEND TO RAILWAY

### Step 1: Create Railway Account
1. Go to: **https://railway.app/**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (use `yogeshppv123-blip` account)
4. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search and select **"Urbanprox"** repository
4. Railway will ask for access → Click **"Install & Authorize"**

### Step 3: Configure Project
1. **Project Name:** Type `urbanprox-backend`
2. **Root Directory:** Click "Add Variable" → Set to `/Urbanvendor/backend`
3. Railway auto-detects Node.js ✅
4. Click **"Deploy"**

### Step 4: Add Environment Variables
1. In Railway dashboard, click **"Variables"** tab
2. Click **"+ New Variable"** and add each:

**Required Variables:**

```bash
MONGODB_URI
```
Value: Your MongoDB connection string
Example: `mongodb+srv://username:password@cluster.mongodb.net/urbanvendor`

```bash
JWT_SECRET
```
Value: Any random secret string (at least 32 characters)
Example: `your-super-secret-jwt-key-change-this-to-random-string`

```bash
PORT
```
Value: `3000`

```bash
FIREBASE_SERVICE_ACCOUNT
```
**IMPORTANT:** Paste the Firebase JSON (already in your clipboard!)
- Press **Cmd+V** to paste
- It should be a single-line JSON string
- Railway will format it automatically

```bash
FIREBASE_PROJECT_ID
```
Value: `urbanprox-7aa0d`

### Step 5: Get Your Backend URL
1. Wait for deployment to complete (1-2 minutes)
2. Look for **"Deployments"** section
3. Click on the latest deployment
4. Find **"Domain"** or **"Public URL"**
5. Copy the URL (e.g., `https://urbanprox-backend-production.up.railway.app`)
6. **Save this URL** - You'll need it for Vercel!

---

## 2️⃣ DEPLOY ADMIN WEB TO VERCEL

### Step 1: Create Vercel Account
1. Go to: **https://vercel.com/**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Sign in with `yogeshppv123-blip` account
5. Authorize Vercel

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find and select **"Urbanprox"**
4. Click **"Import"**

### Step 3: Configure Admin Deployment
**Project Settings:**
- **Project Name:** `urbanprox-admin`
- **Framework Preset:** Choose **"Other"** or **"Expo"**
- **Root Directory:** Click "Edit" → Type `Adminurban`
- **Build Command:** Leave default or use `npm run build`
- **Output Directory:** Leave default

**Environment Variables:**
Click **"Add"** and enter:

```
Name: REACT_APP_API_URL
Value: [PASTE YOUR RAILWAY URL HERE]
```
Example: `https://urbanprox-backend-production.up.railway.app`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your Vercel URL (e.g., `https://urbanprox-admin.vercel.app`)

---

## 3️⃣ DEPLOY VENDOR WEB TO VERCEL

### Step 1: Add New Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select **"Urbanprox"** repository again (yes, same repo!)

### Step 2: Configure Vendor Deployment
**Project Settings:**
- **Project Name:** `urbanprox-vendor`
- **Framework Preset:** **"Other"** or **"Expo"**
- **Root Directory:** `Urbanvendor`
- **Build Command:** Leave default
- **Output Directory:** Leave default

**Environment Variables:**
```
Name: EXPO_PUBLIC_API_URL
Value: [YOUR RAILWAY BACKEND URL]
```

### Step 3: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your Vercel URL (e.g., `https://urbanprox-vendor.vercel.app`)

---

## 4️⃣ DEPLOY USER WEB TO VERCEL

### Step 1: Add New Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select **"Urbanprox"** repository again

### Step 2: Configure User Deployment
**Project Settings:**
- **Project Name:** `urbanprox-user`
- **Framework Preset:** **"Other"** or **"Expo"**
- **Root Directory:** `userurban`
- **Build Command:** Leave default
- **Output Directory:** Leave default

**Environment Variables:**
```
Name: EXPO_PUBLIC_API_URL
Value: [YOUR RAILWAY BACKEND URL]
```

### Step 3: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your Vercel URL (e.g., `https://urbanprox-user.vercel.app`)

---

## ✅ VERIFICATION CHECKLIST

After all deployments are complete:

### Backend (Railway)
- [ ] Deployment shows "Success" status
- [ ] Visit `https://your-backend.railway.app/` → Should show API response
- [ ] Check logs for `✅ Firebase credentials loaded from environment variable`
- [ ] Check logs for `MongoDB connected`

### Admin Web (Vercel)
- [ ] Deployment shows "Ready" status
- [ ] Visit URL → Admin panel should load
- [ ] Login should work
- [ ] Check browser console for errors

### Vendor Web (Vercel)
- [ ] Deployment shows "Ready" status
- [ ] Visit URL → Vendor app should load
- [ ] Test socket connection to backend

### User Web (Vercel)
- [ ] Deployment shows "Ready" status
- [ ] Visit URL → User app should load
- [ ] Test browsing services
- [ ] Test socket notifications

---

## 🔧 TROUBLESHOOTING

### Backend Not Starting
- Check Railway logs for errors
- Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
- Verify `MONGODB_URI` is correct

### Frontend Not Connecting to Backend
- Check if `EXPO_PUBLIC_API_URL` or `REACT_APP_API_URL` is set correctly
- Make sure URL includes `https://` (not `http://`)
- Check CORS settings in backend

### Build Failures on Vercel
- Check build logs
- Verify `Root Directory` is set correctly
- Try redeploying after fixing errors

---

## 📝 YOUR DEPLOYMENT URLS

**Backend (Railway):**
```
https://[YOUR-PROJECT].railway.app
```

**Admin (Vercel):**
```
https://urbanprox-admin.vercel.app
```

**Vendor (Vercel):**
```
https://urbanprox-vendor.vercel.app
```

**User (Vercel):**
```
https://urbanprox-user.vercel.app
```

---

## 🎉 SUCCESS!

Once all 4 deployments are complete, you'll have:
- ✅ Live backend API
- ✅ Live admin panel
- ✅ Live vendor web app
- ✅ Live user web app
- ✅ All connected and working together!

**Note:** Mobile apps (iOS/Android) need to be built with Expo EAS Build separately.

---

## 📱 NEXT: Mobile App Deployment

For mobile apps (later):
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build Android: `cd userurban && eas build --platform android`
4. Build iOS: `eas build --platform ios`
5. Submit to stores: `eas submit`

---

## 🔐 IMPORTANT SECURITY NOTES

1. **Never commit `.env` files** to GitHub
2. **Rotate your `JWT_SECRET` regularly**
3. **Use strong MongoDB passwords**
4. **Keep Firebase credentials secure**
5. **Enable HTTPS only in production**

---

**Need help? Review each section step-by-step and deploy one at a time!**
