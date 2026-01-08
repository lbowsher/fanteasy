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
- `lib/database.types.ts` - Auto-generated Supabase TypeScript types
- `documentation/` - Feature and development docs

### Core Features
- **Draft System** (`app/draft/[id]/`) - Real-time snake/linear draft with auto-pick, queue, timer
- **League Management** (`app/league/[id]/`) - Teams, standings, scoring
- **Authentication** (`app/login/`, `middleware.ts`) - Supabase Auth with Google OAuth and magic links

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

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
