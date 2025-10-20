# AI Protein Tracker

AI-driven web app that estimates protein intake from meal photos, keeps a running daily total, and offers high-protein suggestions tailored to Indian diets.

## Features

- Meal photo upload with OpenAI vision support (fallback estimator when no API key is configured)
- Automatic protein breakdown per food item + daily running total
- Goal planner that uses weight & fitness focus to recommend daily protein targets
- Manual adjustments to tweak estimates before logging meals
- Persisted meal history stored locally per day
- Tailwind-powered responsive UI ready for Vercel deployment

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` with your OpenAI key (optional but recommended for real photo analysis):

```
OPENAI_API_KEY=sk-...
PROTEIN_MODEL=gpt-4o-mini # optional override
```

Without the key the app still works using a nutritional fallback template.

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` and upload meal photos to log protein.

### 4. Build for production

```bash
npm run build
```

## Deployment

The project is optimized for Vercel. After a successful build:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ed521833
```

Set `OPENAI_API_KEY` as a Vercel environment variable so live analysis works.

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS v4
- OpenAI Responses API

## Folder Highlights

- `src/app/page.tsx` — main route wrapping the nutrition experience
- `src/components/` — UI for goals, analyzer, summaries, and history
- `src/app/api/analyze/route.ts` — serverless endpoint for AI-driven protein estimation
- `src/lib/` — reference data + parsing helpers
- `src/contexts/` — client-side state management with persistence

---

Upload a meal, tweak servings if needed, and hit your protein goals with data-driven insights. Enjoy!
