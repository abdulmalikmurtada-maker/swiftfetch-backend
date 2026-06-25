# SwiftFetch 🚀 — Video Downloader

Hausa-language video downloader. Frontend on GitHub Pages, backend on Railway.

---

## 📁 Project Structure

```
swiftfetch/
├── backend/          ← Deploy this to Railway
│   ├── server.js
│   ├── package.json
│   ├── nixpacks.toml
│   ├── railway.json
│   └── Procfile
└── frontend/         ← Push this to GitHub Pages
    └── index.html
```

---

## 🚀 Step 1 — Deploy Backend to Railway (FREE)

1. Go to **https://railway.app** and sign up (GitHub login is easiest)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Push only the `backend/` folder contents to a new GitHub repo (e.g. `swiftfetch-backend`)
4. Railway will auto-detect Node.js and deploy
5. Go to **Settings → Domains** → click **"Generate Domain"**
6. Copy your domain (e.g. `swiftfetch-production.up.railway.app`)

> yt-dlp and ffmpeg are installed automatically via `nixpacks.toml`

---

## 🌐 Step 2 — Update CORS in backend

Open `server.js` and update line 10:

```js
const allowedOrigins = [
  "https://YOUR_GITHUB_USERNAME.github.io",  // ← change this
  ...
];
```

Commit and push. Railway redeploys automatically.

---

## 💻 Step 3 — Update Frontend

Open `frontend/index.html` and update line 3 of the `<script>`:

```js
const BACKEND_URL = "https://YOUR-BACKEND.up.railway.app";
//                           ↑ paste your Railway domain here
```

---

## 📄 Step 4 — Deploy Frontend to GitHub Pages

1. Create a GitHub repo named `swiftfetch` (or any name)
2. Upload `frontend/index.html`
3. Go to repo **Settings → Pages**
4. Source: **Deploy from branch** → `main` → `/ (root)`
5. Save — your site will be at `https://YOUR_USERNAME.github.io/swiftfetch`

---

## ✅ Done!

Your site is live. Test with a YouTube or Facebook URL.

---

## Supported Sites

yt-dlp supports 1000+ sites including:
- YouTube, Facebook, Instagram, TikTok, Twitter/X
- Dailymotion, Vimeo, Reddit, and more

---

## Troubleshooting

| Matsala (Error) | Magani (Fix) |
|---|---|
| CORS error | Make sure your GitHub Pages URL is in `allowedOrigins` in `server.js` |
| Backend not responding | Check Railway logs — the service may have spun down (free tier sleeps after inactivity) |
| "Ba a iya karbar bayanin bidiyo" | The video may be private or geo-restricted |
| Download starts but fails | Some platforms (e.g. Instagram) require login cookies |
