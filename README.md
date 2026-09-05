# STEM-CT Command Center

## Ban Quản lý Tiền cần & Vận hành Sự kiện · Châu Thành STEM

STEM-CT Command Center is an operations workspace for a STEM lab and event team. It brings assets, equipment custody, shifts, tasks, safety incidents, event readiness, knowledge protocols and member progression into one focused command center.

Developer: **Dannz**

## What the app does

- Manage assets, consumables and QR-based equipment workflows.
- Create, borrow, return and audit equipment with custody history.
- Coordinate Normal Mode and Event Mode operations.
- Run shifts, 5S handovers, safety checks and RED CODE incidents.
- Plan tasks with Kanban, Timeline, Gantt and monthly schedule views.
- Detect schedule conflicts and show workload by member.
- Track Merit, Demerit, ranks, badges and leaderboard progress.
- Provide Light Mode and Cyber Metallic Navy Dark Mode.
- Support camera QR scanning with a manual-code fallback.
- Offer Supabase Auth/RBAC and an optional Firebase Auth bridge.
- Continue in Guest Mode for local UI testing when cloud auth is not configured.

## Stack

- React, TypeScript, Vite and Tailwind CSS
- Supabase/PostgreSQL, RLS, RPC and Realtime hooks
- Optional Firebase Authentication with server-side Admin verification
- IndexedDB offline command queue
- `qrcode.react` and `html5-qrcode`
- Inline SVG brand, rank and avatar assets

## Quick start

```powershell
npm install
npm run dev
```

Run quality checks:

```powershell
npm run lint
npm run build
```

For the complete setup sequence, environment variable instructions, database migration order, Firebase configuration and Vercel deployment steps, read [README_INSTRUCTIONS.md](README_INSTRUCTIONS.md).

## Project entry points

- [src/App.tsx](src/App.tsx): application shell and local operational state.
- [src/components/tabs/DashboardTab.tsx](src/components/tabs/DashboardTab.tsx): command center dashboard.
- [src/components/tabs/TaskScheduleTab.tsx](src/components/tabs/TaskScheduleTab.tsx): task and schedule workspace.
- [src/components/QrScannerModal.tsx](src/components/QrScannerModal.tsx): camera QR flow.
- [src/components/brand/UIAssets.tsx](src/components/brand/UIAssets.tsx): generated SVG logo, rank glyphs and avatar glyphs.
- [supabase/migrations/0001_stem_lab_os.sql](supabase/migrations/0001_stem_lab_os.sql): core database schema and RLS.
- [server/firebaseAuthSync.ts](server/firebaseAuthSync.ts): server-side Firebase token verification and ACTIVE/RBAC sync.

## Data and security

Local demo state is a development fallback. Production data must come from the Supabase database and server-side RPCs. Never expose Firebase Admin private keys or Supabase service-role keys in `VITE_*` variables, browser code or committed files.
