# 🚀 Urbanvendor Vercel Deployment Guide

## ✅ **Code is Ready!**
All changes have been pushed to GitHub (commit: `644b42c`)

---

## 📋 **Vercel Deployment Steps**

### **Step 1: Go to Vercel Dashboard**
Open: https://vercel.com/dashboard

---

### **Step 2: Import New Project**

1. Click **"Add New..."** → **"Project"**
2. Select your **GitHub repository**: `Urbanprox`
3. Click **"Import"**

---

### **Step 3: Configure Build Settings**

**Important Settings:**
- **Framework Preset:** Other
- **Root Directory:** `Urbanvendor` ⚠️ **VERY IMPORTANT!**
- **Build Command:** (will be auto-detected from vercel.json)
- **Output Directory:** (will be auto-detected from vercel.json)

---

### **Step 4: Add Environment Variable**

Click **"Environment Variables"** section:

**Add this variable:**
```
Name:  EXPO_PUBLIC_API_URL
Value: https://urbanproxbackend.onrender.com
```

**⚠️ IMPORTANT:** 
- NO `/api` at the end!
- Select: Production, Preview, Development (all three)

---

### **Step 5: Deploy**

Click **"Deploy"** button

**Wait 2-3 minutes** for the build to complete.

---

### **Step 6: Test Your Deployment**

Once deployment is **"Ready"**:

1. Click **"Visit"** to open your Urbanvendor app
2. Press **Cmd+Shift+R** (hard refresh)
3. Open Console (F12)
4. **Look for:** `🌐 Vendor API Base URL: https://urbanproxbackend.onrender.com/api`
5. **Wait 30-60 seconds** on first load (Render cold start)
6. Vendor login/features should work!

---

## 📌 **Summary of Changes Made**

1. ✅ Updated `Urbanvendor/.env` with production API URL
2. ✅ Modified `Urbanvendor/src/services/api/index.ts` to use environment variables
3. ✅ Updated `Urbanvendor/vercel.json` to new format
4. ✅ Pushed all changes to GitHub

---

## 🎯 **Expected Results**

**Console should show:**
```
🌐 Vendor API Base URL: https://urbanproxbackend.onrender.com/api
```

**Features working:**
- Vendor login
- Booking management
- Profile updates
- All API calls to Render backend

---

## 🚨 **Troubleshooting**

**If you see timeout errors:**
- Wait 30-60 seconds (Render cold start)
- Refresh the page

**If you see wrong URL:**
- Check Vercel environment variables
- Redeploy WITHOUT cache

**If build fails:**
- Check build logs in Vercel
- Ensure Root Directory is set to `Urbanvendor`

---

**Ready to deploy! Follow the steps above! 🚀**
