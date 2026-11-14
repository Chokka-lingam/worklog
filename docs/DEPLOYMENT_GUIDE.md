# WorkLog — Deployment Guide

## 1. Overview

This deployment guide covers the local development, Supabase, and Vercel production setup for WorkLog. It is designed for a greenfield implementation and includes operational assumptions and limitations to be validated during implementation.

## 2. Current State

At this stage, the repository is not yet initialized with an application project or software dependencies. The environment currently lacks a usable Node.js installation in the terminal. Before any implementation begins, the environment must be configured with a compatible Node.js LTS version and a package manager.

## 3. Local Development Requirements

### Required tools

- Node.js LTS
- npm, pnpm, or yarn
- Git
- Supabase CLI (recommended)
- a local or cloud Supabase project

### Environment variables

The app should include a `.env.example` file with variables such as:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

> Note: the final environment variable list must align with the installed Next.js and Supabase authentication strategy. The service-role key must never be exposed to the browser.

## 4. Local Development Setup

### 1. Install Node.js

Use a current LTS release that is compatible with the target Next.js version when the project is initialized.

### 2. Initialize project

Use the project package manager that matches the repository conventions, with preference for a single toolchain consistently used across development and CI.

### 3. Install dependencies

Required dependencies include:

- next
- react
- react-dom
- typescript
- tailwindcss
- postcss
- autoprefixer
- @supabase/supabase-js
- @supabase/ssr or the relevant SSR-compatible supabase auth utility for the installed Next.js version
- zod
- react-hook-form
- recharts
- exceljs
- jspdf
- date-fns
- clsx
- tailwind-merge
- lucide-react
- class-variance-authority

### 4. Configure environment

- set `NEXT_PUBLIC_SUPABASE_URL`
- set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- configure `SUPABASE_SERVICE_ROLE_KEY` only for secure server-side usage
- ensure auth redirect URLs are valid for local development

### 5. Run migrations

Use migration files under `supabase/migrations/` to create the schema.

### 6. Run the app

```bash
npm install
npm run dev
```

or whichever package manager is selected.

## 5. Supabase Setup

### Create a new project

1. Create a Supabase project in the Supabase dashboard.
2. Record the project URL and anon key.
3. Configure authentication providers required for the release.
4. Set redirect URLs for local and production auth sessions.

### Configure database

- apply the migration scripts
- validate that the required tables exist
- verify RLS policies are enabled
- test as a user from the app

### Authentication configuration

The application must use the recommended Supabase SSR auth flow appropriate to the installed Next.js version. This includes:

- protected routes
- server-side session validation
- route-level access control
- redirect handling for unauthenticated access

### Email provider requirements

Password reset and invite flows depend on an email delivery provider configured in Supabase Auth. If the project is using free-tier or low-cost infrastructure, there may be provider limitations or delivery restrictions. These should be documented before release. A project without a working email provider cannot complete secure recovery flows.

## 6. Vercel Deployment

### Deployment flow

1. connect the Git repository to Vercel
2. configure the framework as Next.js
3. add environment variables in Vercel
4. ensure the production database URL entries are valid
5. deploy the app and validate the production build

### Required production checks

- application boots in production mode
- auth works with Supabase redirect URLs
- RLS policies are enforced in production
- exported reports generate correctly
- dashboards query the correct workspace data

## 7. Free-Tier and Platform Constraints

The application should not assume unrestricted free usage of every service.

### Supabase

- free-tier limits vary by plan and are subject to change
- database size, API usage, and auth quota limits must be checked at implementation time
- email delivery constraints may affect reset and invite flows

### Vercel

- free-tier deployment limits, bandwidth, build limits, and team/project constraints may change over time
- usage must remain within the provider’s terms

### Operational recommendation

Document actual limits in deployment notes before production launch. The app should also provide guidance for alternative self-hosting or migration options if the free tier is insufficient for expected usage.

## 8. Production Readiness Checklist

- Node.js version validated
- package manager version validated
- `.env.example` created
- Supabase migrations applied
- auth configured and tested
- RLS in place
- database connectivity valid
- export functionality tested in production-like environment
- build passes without warnings that hide defects
- secret management follows least-privilege principles

## 9. Risks and Limitations

- The app cannot reliably operate without a configured Supabase project and valid environment variables.
- Password reset and invite emails require a functioning email backend or provider.
- Free-tier limits may affect team collaboration and production rollout depending on scale.
- Production deployment should be validated after initialization, not assumed from theory.

## 10. Deployment Recommendation

The safest production path is:

- local development with Supabase project and migrations
- Vercel deployment for the frontend
- Supabase for database and auth
- explicit verification of auth redirect URLs and database access for each environment

This architecture is simple, inexpensive, and meets the brief without forcing paid APIs for core functionality.
