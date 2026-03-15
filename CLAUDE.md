# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

Fanteasy is a fantasy sports league application supporting NFL, NBA, and NCAAM leagues with real-time drafting.

**Tech Stack:** Next.js 15 (App Router) + React 19 + Supabase (auth, database, realtime) + Tailwind CSS

### Key Directories
- `app/` - Next.js App Router pages and components (colocated by feature)
- `app/utils/supabase/` - Supabase client utilities (server.ts, client.ts, middleware.ts)
- `app/utils/scoring.ts` - Fantasy points calculation for NFL/NBA
- `app/global.d.ts` - Extended relationship types (TeamWithLeague, DraftPickWithDetails, etc.)
- `lib/database.types.ts` - Auto-generated Supabase TypeScript types
- `documentation/` - Feature and development docs
- `scrapers/` - Python data scrapers for NFL, NBA, and NCAA
- `migration2026/` - Data migration utilities

### Core Features
- **Draft System** (`app/draft/[id]/`) - Real-time snake/linear draft with auto-pick, queue, server-authoritative timer
- **League Management** (`app/league/[id]/`) - Teams, standings, scoring
- **Weekly Picks** (`app/league/[id]/`) - Playoff lineup selection with position slots, cross-week duplicate prevention, and lock management
- **Authentication** (`app/login/`, `middleware.ts`) - Supabase Auth with Google OAuth, Google One-Tap, and magic links

### Database Tables
Key tables: `leagues`, `teams`, `players`, `profiles`, `game_stats`, `draft_settings`, `draft_picks`, `draft_queue`, `weekly_picks`

Auto-generated types from Supabase are in `lib/database.types.ts`. Extended relationship types are in `app/global.d.ts`.

## Supabase Auth - Critical Pattern

**MUST use `@supabase/ssr` with `getAll`/`setAll` pattern. NEVER use deprecated `get`/`set`/`remove` methods or `@supabase/auth-helpers-nextjs`.**

See `documentation/development/auth.md` for correct implementation patterns.

Server client: `app/utils/supabase/server.ts`
Browser client: `app/utils/supabase/client.ts`
Middleware: `middleware.ts`

## Theme System

Uses CSS custom properties with `data-theme` attribute on `<html>`:
- Dark mode (default): `--background`, `--surface`, `--primary-text` etc.
- Light mode: `html[data-theme="light"]` overrides
- Theme state persisted in localStorage
- Custom Tailwind colors defined in `tailwind.config.ts`: liquid-lava, dark-void, snow, dusty-grey, gluon-grey, slate-grey

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Draft System Architecture

All draft mutations go through Server Actions (`app/draft/[id]/actions.ts`) calling the `make_draft_pick` Postgres RPC — **do NOT add direct client-side writes to `draft_picks` or `draft_settings`**.

- **Timer**: Server-authoritative via `timer_started_at` column on `draft_settings`, broadcast to clients via Realtime. The client timer (`draft-timer.tsx`) derives remaining time from this timestamp.
- **Auto-pick**: The `auto_pick_expired_drafts()` PG function is designed to run via `pg_cron` (every 5s). If pg_cron is unavailable, use the `/api/draft/auto-pick` route as a fallback (called client-side when the timer expires).
- **Commissioner**: Can pick for any team during that team's turn. The turn check lives in both `actions.ts` (server action layer) and the `make_draft_pick` RPC (DB layer).
- **RLS TODO**: Direct-write RLS policies on `draft_picks` and `draft_settings` are intentionally permissive while the RPC flow is being validated. See `documentation/TODO-rls-policies.md` for the tightening plan before production.

## Python Scrapers

Use `uv` to run Python scripts in the `scrapers/` directory:
```bash
uv run python scrapers/nfl/nfl-playoffs-scraper.py
uv run python scrapers/nba/add-new-players.py
uv run python scrapers/ncaa/ncaa-update-scores.py
```
