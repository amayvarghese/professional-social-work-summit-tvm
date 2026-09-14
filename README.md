# Kerala Professional Social Work Summit — Photo Frame App

Mobile web app for the **1st Kerala Professional Social Work Summit** (23 September 2026, Trivandrum).

Participants enter name, mobile, and email (saved to MongoDB), take a selfie inside the summit frame, then save the image or share it on WhatsApp with a fullscreen link others can open — plus a link to create their own.

## Features

- Registration form → MongoDB
- Live camera with summit frame overlay
- Circular photo compositing into your frame PNG
- Save framed image to device
- WhatsApp share with fullscreen photo page + “Create yours” link

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and set:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/kerala-summit
```

`NEXT_PUBLIC_APP_URL` is optional — share links fall back to the Vercel
deployment URL, and then to the incoming request origin. Set it only once you
attach a custom domain.

### 3. Start MongoDB

Local example:

```bash
brew services start mongodb-community
```

Or use a MongoDB Atlas connection string in `MONGODB_URI`.

### 4. Frame image

The frame with a transparent circular cutout lives at:

`public/frames/summit-frame.png`

To regenerate from `frame-source.jpg` (after replacing the source):

```bash
node scripts/make-frame.mjs
```

Tune circle position in `scripts/make-frame.mjs` and `src/lib/frame.ts` / `src/lib/compose.ts` if your frame artwork changes.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (same Wi‑Fi) using your computer’s LAN IP, e.g. `http://192.168.x.x:3000`. **Camera requires HTTPS** on real devices (or `localhost`).

## Flow

1. `/` — name, mobile, email → saved via `POST /api/register`
2. `/camera` — live preview + frame overlay → capture
3. `/result` — Save to photos / Share on WhatsApp
4. `/p/[id]` — fullscreen shared photo + “Create your own frame”

## Deploying to Vercel

1. **MongoDB Atlas** — create a free cluster. Under *Network Access*, allow
   `0.0.0.0/0`: Vercel functions have no fixed outbound IP, so an allowlist of
   specific addresses will fail.
2. **Import the repo** on Vercel. The framework preset, build command, and
   output settings are all detected automatically.
3. **Environment variables** — add `MONGODB_URI` for Production, Preview, and
   Development. That is the only required variable.
4. **Deploy.** Add `NEXT_PUBLIC_APP_URL` later if you attach a custom domain,
   so WhatsApp links point at the domain rather than the `.vercel.app` host.

### How images are stored

Vercel's filesystem is read-only at runtime, so framed photos are **not**
written to disk. Each capture is stored as JPEG bytes on the `Share` document
in MongoDB and served from `GET /api/image/[shareId]` with a one-year immutable
cache header.

Two constraints follow from that:

- Photos are encoded as JPEG (quality 0.92, ~350–900 KB) rather than PNG
  (~2.7 MB). Vercel caps a request body at 4.5 MB.
- The route rejects anything over 6 MB, well under MongoDB's 16 MB document cap.

If share volume grows past a few thousand photos, move the bytes to Vercel Blob
or S3 and keep only the URL on the `Share` document — `/api/image/[id]` is the
single place that reads them.
