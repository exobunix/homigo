# 🚀 VPS Deployment Guide - Hostinger Ubuntu (Nginx + PM2)

This guide documents the exact configuration used to deploy the **Urbanprox** platform on your Hostinger VPS (`72.61.172.182`).

---

## 🏗️ 1. Server Configuration

### Folder Structure
All applications are stored in `/var/www/urbanprox`:
- Backend API: `/var/www/urbanprox/Urbanvendor/backend`
- User Web: `/var/www/urbanprox/userurban/dist`
- Admin Web: `/var/www/urbanprox/Adminurban/dist`
- Vendor Web: `/var/www/urbanprox/Urbanvendor/dist`

---

## 🛠️ 2. Backend API Setup (PM2)

The backend runs on Port `5004` managed by **PM2**.

### Initial Setup
```bash
cd /var/www/urbanprox/Urbanvendor/backend
npm install
# Create .env file
# MONGODB_URI=mongodb+srv://urbanprox:URbanProx556677@urbanprox.hgd4ssb.mongodb.net/urban_prox
# JWT_SECRET=urbanprox_secret_key_2024
# PORT=5004
# FIREBASE_PROJECT_ID=urbanprox-7aa0d

# Start backend
pm2 start src/server.js --name urbanprox-backend
pm2 save
```

### Update Backend
```bash
cd /var/www/urbanprox
git pull origin main
cd Urbanvendor/backend
npm install
pm2 restart urbanprox-backend
```

---

## 🌐 3. Frontend Deployment (Nginx)

All three frontends are built as static files and served by **Nginx**.

### Building
```bash
# Admin
cd /var/www/urbanprox/Adminurban
EXPO_PUBLIC_API_URL=https://api.urbanprox.com npx expo export --platform web

# User
cd /var/www/urbanprox/userurban
EXPO_PUBLIC_API_URL=https://api.urbanprox.com npx expo export --platform web

# Vendor
cd /var/www/urbanprox/Urbanvendor
EXPO_PUBLIC_API_URL=https://api.urbanprox.com npx expo export --platform web
```

### Nginx Config (`/etc/nginx/sites-available/urbanprox`)
```nginx
server {
    listen 80;
    server_name urbanprox.com www.urbanprox.com;

    location / {
        root /var/www/urbanprox/userurban/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name admin.urbanprox.com;

    location / {
        root /var/www/urbanprox/Adminurban/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name vendor.urbanprox.com;

    location / {
        root /var/www/urbanprox/Urbanvendor/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Enable Nginx Config
```bash
ln -s /etc/nginx/sites-available/urbanprox /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🔒 4. SSL (HTTPS) with Certbot

All domains are secured with **Let's Encrypt**.

### Domains:
- `urbanprox.com`
- `admin.urbanprox.com`
- `vendor.urbanprox.com`
- `api.urbanprox.com`

### Certbot Command:
```bash
certbot --nginx -d urbanprox.com -d www.urbanprox.com -d admin.urbanprox.com -d vendor.urbanprox.com -d api.urbanprox.com
```

---

## 🔥 5. Automation (Deployment Script)

Use the `./deploy.sh` script to pull changes and redeploy everything in one go.
```bash
chmod +x deploy.sh
./deploy.sh
```
