# PowerHouse — Phase 1 (Live Niches + Keywords)

## Features
- `/.netlify/functions/niches` → Google Trends (US daily RSS)
- `/.netlify/functions/keywords?niche=...` → Google Autocomplete
- Dark dashboard with 💵 “Buckle up... cash incoming soon!” loader

## Deploy Steps
1. Push to GitHub (`powerhouse` repo).
2. Netlify → Import repo → Publish dir = `.`, Functions dir = `netlify/functions`.
3. Deploy site.

## Test
- Open: `https://YOUR-SITE.netlify.app/.netlify/functions/niches`
- Open: `https://YOUR-SITE.netlify.app/.netlify/functions/keywords?niche=drone`
