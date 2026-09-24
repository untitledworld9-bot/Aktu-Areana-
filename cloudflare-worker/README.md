# AKTU Arena — Cloudflare Worker Deployment Guide

Ye guide aapko Cloudflare Worker setup karne aur Google AI Studio ke **Gemini Free Tier API** ke saath connect karne me madad karegi.

---

## Step 1: Gemini Free Tier API Key Lein (100% Free)
1. Browser me open karein: **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Apne Google Account se sign in karein.
3. **"Create API key"** par click karein.
4. Apni API key copy kar lein (e.g. `AIzaSy...`).
> **Note on Free Tier**: Google AI Studio ka `gemini-2.5-flash` model **1,500 requests per day** aur **15 requests per minute** bilkul FREE deta hai, jo engineering practice ke liye kaafi hai!

---

## Step 2: Cloudflare Worker Setup (Dashboard se 2 Minute me)

1. **Cloudflare Dashboard** me login karein: [dash.cloudflare.com](https://dash.cloudflare.com)
2. Left menu se **"Workers & Pages"** $\rightarrow$ **"Create application"** $\rightarrow$ **"Create Worker"** par click karein.
3. Worker ka naam dein (jaise: `aktu-arena-api`) aur **Deploy** click karein.
4. Deploy hone ke baad **"Edit code"** (Quick Edit) par click karein.
5. Left side ke editor me jo purana code hai usko delete karein aur hamari **`worker.js`** file ka poora code paste kar dein.
6. Upar **"Save and deploy"** par click karein.

---

## Step 3: Worker me `GEMINI_API_KEY` Secret Add Karein

1. Apne Worker ke page par jayein (`aktu-arena-api`).
2. **Settings** $\rightarrow$ **"Variables and Secrets"** (ya **Variables**) par jayein.
3. **"Add"** par click karein:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: Apni Google AI Studio wali API key paste karein.
   - **Type**: **Secret** (Encrypt) select karein.
4. **Save and Deploy** click karein.

---

## Step 4: Worker URL Copy Karein aur Frontend me Set Karein

1. Aapke Worker ka ek URL hoga, jaise:
   `https://aktu-arena-api.<your-subdomain>.workers.dev`
2. Test karein browser me open karke:
   `https://aktu-arena-api.<your-subdomain>.workers.dev/api/health`
   (Ye `{ "status": "ok", "hasGeminiKey": true }` return karega!)

3. **Frontend Connection**:
   - Jab aap apna frontend **Cloudflare Pages** ya GitHub se deploy karein, to bas Environment Variables me add karein:
     ```env
     VITE_API_BASE_URL=https://aktu-arena-api.<your-subdomain>.workers.dev
     ```
   - Ya agar aap local test kar rahe hain, to project ke `.env` file me likhein:
     ```env
     VITE_API_BASE_URL=https://aktu-arena-api.<your-subdomain>.workers.dev
     ```

---

## Alternative: Wrangler CLI se Deploy (Agar Terminal use karna ho)
```bash
cd cloudflare-worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

Bas itna hi! Ab aapka frontend Cloudflare Pages par aur AI backend Cloudflare Worker par 100% free chalega!
