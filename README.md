# MavOS

Personal life operating system. Built for Michael's use — tasks, finances, scripture, health, and journal/worldbuilding in one dark-themed PWA.

## Stack

- **Vite + React + TypeScript** — same muscle memory as Maverick Sports Agency
- **Zustand** for state
- **Tailwind** for styling (dark-only, muted gold accent)
- **Supabase** — Postgres + auth + row-level security
- **vite-plugin-pwa** — installable on phone and desktop
- **React Router** — client-side routing

## What's in v0.1

| Module      | What it does                                                  |
| ----------- | ------------------------------------------------------------- |
| Dashboard   | Morning screen — open tasks, month finances, last scripture, last health log |
| Tasks       | Open/Done/All filter, checkbox toggle, archive                |
| Finances    | Month view with income/expense/tithe/giving totals            |
| Scripture   | KJV study log with notes and tags                             |
| Health      | Workouts, smoke sessions, meals, custom logs                  |
| Journal     | Inline today editor + history; daily/worldbuilding/sermon/note kinds |

## The capture bar (⌘K)

Press `⌘K` (or `Ctrl+K`) anywhere. Prefixes auto-route:

| Prefix  | Lands in              | Example                                      |
| ------- | --------------------- | -------------------------------------------- |
| _(none)_ | Tasks                | `pick up bolts at Home Depot`                |
| `t:`    | Tasks (explicit)      | `t: call about the appraisal`                |
| `j:`    | Journal (today)       | `j: good prep meeting with Deisha`           |
| `$:`    | Finances              | `$: 42.18 groceries` · `$: 200 tithe`        |
| `s:`    | Scripture log         | `s: Rom 8:28 — god works all things`         |
| `h:`    | Health log            | `h: grilled ribeye medium rare`              |

`$:` auto-detects `tithe` and `giving/offering` keywords and classifies accordingly.
`h:` auto-classifies by keyword (workout / smoke / meal / custom).

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. Project Settings → API → copy the **URL** and **anon public** key.
3. SQL Editor → New query → paste the contents of `schema.sql` → Run.

### 2. Configure environment

```bash
cp .env.local.example .env.local
# then edit .env.local with the URL + anon key from step 1
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), enter your email, click the magic link, and you're in.

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel dashboard. Every push to `main` will redeploy.

## Adding your wife later

When/if she joins:

1. Share the deployed URL with her.
2. She enters her email, gets her own magic link, creates her own account.
3. Row Level Security means her data is fully separate from yours — no code changes needed.

## Project layout

```
src/
├── App.tsx                    # routing + auth gate
├── main.tsx                   # entry
├── components/
│   ├── Shell.tsx              # sidebar, header, bottom nav, hotkeys
│   ├── CaptureBar.tsx         # ⌘K global capture with prefix router
│   ├── SignIn.tsx             # magic link screen
│   ├── SetupScreen.tsx        # shown when env vars missing
│   └── ui.tsx                 # PageIntro, SectionHeader, EmptyState
├── lib/
│   └── supabase.ts            # typed client singleton
├── modules/
│   ├── dashboard/Dashboard.tsx
│   ├── tasks/Tasks.tsx
│   ├── finances/Finances.tsx
│   ├── scripture/Scripture.tsx
│   ├── health/Health.tsx
│   └── journal/Journal.tsx
├── store/
│   ├── auth.ts                # session + magic link
│   ├── tasks.ts               # CRUD
│   └── capture.ts             # capture bar open/close
├── styles/
│   └── index.css              # Tailwind + design tokens
└── types/
    └── database.ts            # Supabase schema types
```

## Design tokens

- **Background:** `#0a0a0a` (ink-900) with subtle gold radial gradients
- **Accent:** `#c9a961` (muted gold) — used sparingly on CTAs, tithe numbers, active nav
- **Fonts:** Fraunces (display), Inter Tight (body), JetBrains Mono (kbd)

## What's next (roadmap ideas)

Based on your app ideas backlog, natural v0.2 additions:

- **Tundra module** — mileage + service log (feeds Tasks when intervals hit)
- **ReKindle module** — attendance, events, reward tiers; separate from Tasks but feeds the Dashboard
- **AI daily roll-up** — end-of-day Claude API call that summarizes everything logged into a journal note
- **PaycheckPlanner port** — pull your existing component into `/finances/planner`
- **Codex** — branch off Journal into a proper ATDaItM codex with linked entities

## Notes

- Service worker is enabled — after first load it works offline for reads. Writes queue via Supabase.
- TypeScript is strict. Run `npm run typecheck` before committing.
- No tests yet. Add Vitest when the app solidifies past v0.1.
