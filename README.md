# Information Systems Master Applications

## Executive Snapshot
- Transforms the Master of Information Systems admissions workflow into a digital, transparent process (dashboards, reviews, reporting).
- Primary users: the university review team that previously coordinated decisions with Excel and email.
- Outcome: a secure admin portal with status tracking, document review, scoring, and export features that shorten turnaround time.

## Product Highlights
- Covers the entire journey: submission -> document and course review -> committee decision workflow.
- Human-centered Nuxt UI with filtering, validation messaging, and accessible defaults.
- AI-assisted course suggestions via the OpenAI client, always double-checked by reviewers for compliance.
- S3-compatible storage (MinIO) with rules to keep applicant documents on-premises.
- Slide decks and speaker notes (`/slides`) that let stakeholders run their own demos.

## Tech Stack At A Glance
- `Nuxt 4`, `Vue 3`, `@nuxt/ui`, `Pinia`, `nuxt-auth-utils` for session handling.
- `TypeScript`, `Zod` validation, `Drizzle ORM` with PostgreSQL.
- `MinIO` for document storage, optional `OpenAI` client integration.
- Supporting assets: demo data fixtures and a Python script for stakeholder slide generation.

## Status & Roadmap
- Current state: production-grade admin prototype with demo data and presentation materials.
- Upcoming ideas: notifications, granular roles, audit logging, automated scoring rules.
- Feedback loop with faculty and admissions staff drives future iterations; codebase intentionally remains open.

## Demo & Screens
- `slides/README.md` documents the demo storyline plus a PowerPoint generator.
- `shared/utils/dummy.ts` ships realistic mock data for course predictions and tables.
- `scripts/capture-screenshots.mjs` records consistent screenshots for stakeholder decks.

---

## Developer Appendix

### 1. Prerequisites
- PostgreSQL
- MinIO

### 2. Create `.env`
Copy `.env.example`, fill out database, MinIO, session, and OpenAI values. Keep real secrets local and untracked.

### 3. Install Dependencies
```bash
npm install
```

### 4. Push Database Schema
```bash
npx drizzle-kit push
```

### 5. Start Dev Server
```bash
npm run dev
```

### 6. Seed Initial Admin
```bash
export SEED_ADMIN_EMAIL=admin@example.com
export SEED_ADMIN_PASSWORD=ChangeMe123!
```
Optional: `SEED_ADMIN_FIRST_NAME`, `SEED_ADMIN_LAST_NAME`. Run the `db:seed-admin` task in Nuxt Devtools, then sign in at `/admin/login`.

### 7. Optional Demo Data
Nuxt Devtools tasks: `seedAdmins`, `seedApplicants`.

### 8. Proprietary Assets
Place university PDFs or logos locally under `public/`; the repo ships no protected documents.

### Production
```bash
npm run build
node .output/server/index.mjs
```
More information: [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment).
