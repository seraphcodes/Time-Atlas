# Deploying TimeAtlas to Vercel

Everything is already set up (`vercel.json`, meta tags, social preview image, icons). You only need to push and import.

## What you need

- Node 20 or newer (`node -v`)
- A GitHub account and a Vercel account (the free "Hobby" plan is enough)

## 1. Check it locally (2 minutes)

```bash
cd timeatlas
npm ci
npm run build
npm run preview        # opens http://localhost:4173
```

Scroll the whole journey once. If it works here, it works on Vercel.

## 2. Put it on GitHub

```bash
git init
git add .
git commit -m "TimeAtlas: Giza, 2560 BC"
git branch -M main
git remote add origin https://github.com/<your-name>/timeatlas.git
git push -u origin main
```

A private repository is fine.

## 3. Import into Vercel

1. vercel.com → **Add New… → Project** → pick the `timeatlas` repository.
2. Vercel detects **Vite**. Leave the defaults: build command `npm run build`, output directory `dist`.
3. Click **Deploy**. About a minute later you get a live address like `timeatlas.vercel.app`.

Every later `git push` redeploys automatically.

*Without GitHub:* `npm i -g vercel`, then `vercel` in the project folder, then `vercel --prod`.

## 4. After the first deploy

- Open the address on your phone and on a laptop. Scroll through all six scenes, open a marker, move the slider.
- **Refresh the link preview**: paste the address into LinkedIn's Post Inspector (linkedin.com/post-inspector) so the preview image appears in your post.
- **Custom domain** (optional): Project → Settings → Domains. Then add an environment variable `SITE_URL` with your full address (for example `https://timeatlas.app`) and redeploy, so the preview image and canonical address use it.

## 5. Before you share it widely (Germany)

- **Imprint (Impressum) and privacy notice.** A public website that is more than purely private normally needs an Impressum in Germany, and a portfolio piece you promote on LinkedIn very likely counts. I am not a lawyer; please check the rules or use a generator. TimeAtlas sets no cookies, loads nothing from third parties and has no analytics, so the privacy notice can be short. Phase 5 (the platform) has an About page where both belong.
- The fact-check lives in `FACT-CHECK.md`. The books it cites were not read directly; see "Still open" at the bottom.

## If something goes wrong

| Symptom | Fix |
| --- | --- |
| Vercel build fails on Node version | Project → Settings → General → Node.js Version → 20.x or 22.x |
| Blank page, text version of the story | The browser or device cannot run WebGL. Try another browser; this is the intended fallback |
| Slow on an old laptop | It lowers quality automatically. `?q=low` forces the light version for testing |
| Preview image missing on LinkedIn | Run the Post Inspector on the address; LinkedIn caches previews |

## Handy things

- `?t=2.85` jumps to a moment (0 to 5.5). `?q=high` / `?q=low` fixes the quality level.
- Everything that is shown as text is in `src/content/giza.js` and `src/content/hotspots.js`.
