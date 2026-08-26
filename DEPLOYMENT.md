# 🚀 CR Cosmetics & Essentials — Vercel Deployment Guide

This project is built on **Next.js 16 (App Router)** with **Neon PostgreSQL**, native serverless API routes, dynamic SEO sitemaps, robots.txt, PWA Web Manifest, security headers, and an end-to-end commerce engine.

---

## ⚡ 1-Click Deployment on Vercel

Vercel provides native zero-config deployment for Next.js with global Edge caching and Neon PostgreSQL integration.

### Step 1: Push Code to GitHub / GitLab
```bash
git init
git add .
git commit -m "feat: complete CR Cosmetics platform with Neon PostgreSQL"
git branch -M main
git remote add origin https://github.com/your-username/cr-cosmetics.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your `cr-cosmetics` repository.
3. In the **Environment Variables** section, add:
   - **`DATABASE_URL`**: `postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **`NEXT_PUBLIC_SITE_URL`**: `https://your-vercel-domain.vercel.app` (or your custom domain)
   - **`NEXT_PUBLIC_WHATSAPP_NUMBER`**: `233592153306`
   - **`NEXT_PUBLIC_CURRENCY`**: `GHS`
4. Click **"Deploy"**.

Your live store with Neon PostgreSQL database persistence will be online in ~45 seconds!

---

## 🔧 Environment Variables Summary

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_NTQDd27Agkuw@...` | Neon Serverless PostgreSQL database connection |
| `NEXT_PUBLIC_SITE_URL` | `https://crcosmetics.gh` | Public canonical site URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `233592153306` | WhatsApp Customer Service line |
| `NEXT_PUBLIC_CURRENCY` | `GHS` | Currency code (Ghanaian Cedi) |
| `NEXT_PUBLIC_STORE_LOCATION` | `Botwe, near Galaxy International School, Accra, Ghana` | Physical store location |

---

## 🛡️ Verification Checklist
- [x] **Vercel Config**: `vercel.json` configured for Next.js app router.
- [x] **Neon DB**: Live serverless connection pooling via `@neondatabase/serverless`.
- [x] **SEO**: Dynamic `/sitemap.xml` and `/robots.txt` active.
- [x] **PWA**: `/manifest.webmanifest` installable on mobile devices.
- [x] **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and cache control.
