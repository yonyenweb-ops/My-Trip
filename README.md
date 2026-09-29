# Trip Money

A simple personal travel wallet. Enter your starting money, record every expense, and always know how much is left.

- Next.js (App Router) + TypeScript + Tailwind CSS
- Data is saved in the browser's `localStorage` (key `trip-money-manager`), no backend or login
- Money is stored as integer cents ($210.54 → `21054`), so there are no floating-point errors
- Totals are always calculated from the expense list, so editing or deleting an expense updates everything

## Pages

| Route                 | What it shows                                   |
| --------------------- | ----------------------------------------------- |
| `/`                   | Dashboard for the current (latest active) trip |
| `/trips`              | All trips with budget / spent / remaining       |
| `/trips/new`          | Create a trip                                   |
| `/trips/[id]`         | Trip details, full expense history, close trip  |
| `/trips/[id]/summary` | Final summary with spending by category         |

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

To test on your phone on the same Wi-Fi, run `npm run dev -- -H 0.0.0.0` and open `http://<your-computer-ip>:3000`.

## Build

```bash
npm run build
npm start          # serve the production build locally
```

## Put it on GitHub

```bash
git add -A
git commit -m "Trip Money v1"
# create an empty repo on github.com (e.g. trip-money), then:
git remote add origin https://github.com/<your-username>/trip-money.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

**Option A: from GitHub (recommended, redeploys on every push)**

1. Sign in at https://vercel.com with your GitHub account.
2. **Add New → Project**, then pick the `trip-money` repo and click **Import**.
3. Leave the defaults (Framework: Next.js) and click **Deploy**.
4. You get a URL like `https://trip-money.vercel.app`. Every `git push` to `main` updates production.

**Option B: from this folder with the CLI**

```bash
npx vercel          # first time: log in, accept the defaults → preview URL
npx vercel --prod   # deploy to production
```

## Using it on your phone

Open the Vercel URL on your phone and choose **Add to Home Screen** (Safari: Share button; Chrome: ⋮ menu). It then opens like an app.

> Data lives in that one browser on that one device. Opening the site on another phone or in another browser starts empty, and clearing the browser's site data deletes your trips.
