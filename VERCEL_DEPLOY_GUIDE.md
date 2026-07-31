# 🚀 Vercel Deployment - Quick Fix Guide

## ✅ **Updated Build Configuration**

The vercel.json files have been updated to use the new Expo export command.

---

## 📋 **Vercel Project Settings**

When deploying to Vercel, use these EXACT settings:

### **1. User App (userurban)**

**Import Project:**
- Repository: `Urbanprox`
- Root Directory: `userurban`

**Build Settings:**
- Framework Preset: **Other** (or leave as detected)
- Build Command: `npx expo export --platform web`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```
EXPO_PUBLIC_API_URL = https://your-render-backend-url.onrender.com
```

---

### **2. Vendor App (Urbanvendor)**

**Import Project:**
- Repository: `Urbanprox`
- Root Directory: `Urbanvendor`

**Build Settings:**
- Framework Preset: **Other**
- Build Command: `npx expo export --platform web`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```
EXPO_PUBLIC_API_URL = https://your-render-backend-url.onrender.com
```

---

### **3. Admin App (Adminurban)**

**Import Project:**
- Repository: `Urbanprox`
- Root Directory: `Adminurban`

**Build Settings:**
- Framework Preset: **Vite** (or Other)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```
REACT_APP_API_URL = https://your-render-backend-url.onrender.com
```

---

## 🔧 **Troubleshooting Build Errors**

### **Error: "expo export:web can only be used with Webpack"**
✅ **FIXED!** We updated to `npx expo export --platform web`

### **Error: "404 NOT_FOUND"**
✅ **FIXED!** Added `vercel.json` with routing rules

### **Error: "Cannot find module 'expo'"**
- Make sure `Root Directory` is set correctly
- Vercel should install dependencies from the correct `package.json`

### **Error: "Build failed"**
1. Check build logs
2. Verify `package.json` has all dependencies
3. Try adding `NODE_VERSION=18` environment variable

---

## ⚡ **Quick Deploy Checklist**

For each app on Vercel:

1. ✅ Import from GitHub (Urbanprox repo)
2. ✅ Set correct Root Directory
3. ✅ Add environment variable with backend URL
4. ✅ Deploy
5. ✅ Wait for build (2-3 minutes)
6. ✅ Visit deployed URL
7. ✅ Check console for errors

---

## 🎯 **Expected Build Output**

You should see:
```
> npx expo export --platform web
Starting Metro Bundler
Bundling for web...
✓ Exported web bundle
Build completed successfully
```

Then Vercel will deploy the `dist` folder.

---

## 🌐 **Testing Your Deployment**

After deployment:

1. **Visit the URL** - Should load without 404
2. **Check Network Tab** - Should call your Render backend API
3. **Test Login** - Should authenticate successfully
4. **Check Console** - Look for socket connection logs

---

## 📱 **Your Deployment URLs**

Once deployed, save these:

```
Admin:  https://urbanprox-admin.vercel.app
Vendor: https://urbanprox-vendor.vercel.app  
User:   https://urbanprox-user.vercel.app
```

---

**The configuration is now correct. Vercel should automatically redeploy within 1-2 minutes!**
