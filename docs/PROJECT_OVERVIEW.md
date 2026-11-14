# WorkLog — Project Overview

## 1. Project Summary

WorkLog is a personal work management and performance tracking platform intended to replace repetitive manual activity documentation and spreadsheet-based reporting. It is designed for individual users and small-team workspaces, with a strict separation between private user data and workspace-shared data.

The system focuses on:

- task creation and tracking
- reusable templates
- time recording for productive work and non-productive intervals
- daily/weekly/monthly productivity analytics
- historical activity auditing
- professional report exports in Excel and PDF
- secure, role-aware collaboration for small teams

## 2. Repository Assessment

The current repository is effectively empty. A broad scan of the filesystem shows no active application project, no `package.json`, no Next.js app structure, no lockfile, and no existing frontend/backend codebase to preserve. No existing route, database migration, or deployment configuration was found.

This means the project must be treated as a greenfield application and created in a new working directory, starting with Phase 2 foundations after the architecture is approved.

## 3. Environment Assessment

The current machine environment does not currently expose a usable Node.js toolchain in `PATH`:

- `node` is not recognized
- `npm` is not recognized
- `pnpm` and `yarn` are also not available in the current terminal environment

This is a key setup prerequisite before implementation can begin. The project should not be initialized until a compatible Node.js LTS version and package manager are installed and validated.

## 4. Product Goals

WorkLog solves four core problems:

1. repeated task tracking without structured records
2. inconsistent manual time estimation and report generation
3. disconnected productivity history across days and weeks
4. lack of secure, role-aware small-team collaboration while preserving personal privacy

## 5. Target Users

### Individual users

- manage daily office work
- track productive hours accurately
- generate weekly/monthly summaries
- prepare reports without exporting raw spreadsheets

### Small teams

- share a workspace with explicit invitations
- keep private work data isolated
- assign project and task ownership
- review reporting without exposing other users' private contexts

## 6. Role Model

The system supports:

- Owner: full workspace control
- Admin: member management and shared resource control
- Member: access to authorized workspace features

The initial implementation is intentionally not enterprise-grade; it is designed to support private work plus small-team collaboration patterns.

## 7. Architecture Direction

The application will use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth + Postgres
- RLS-enforced data access
- Recharts for analytics
- ExcelJS and jsPDF for export
- Vitest and Playwright for quality assurance

## 8. Key Assumptions

- The initial release is personal-first but workspace-aware.
- The system should support a default personal workspace for each new user.
- User preferences and private data remain isolated unless intentionally shared.
- All time tracking is database-driven and server-authoritative.
- Timer state is treated as critical business logic, not a browser-only convenience.
- The system will prefer clear, auditable historical records over convenience shortcuts.

## 9. Business Scope

The MVP architecture supports all major modules listed in the brief:

- authentication and user management
- dashboard
- tasks and templates
- real-time time tracking, breaks, and lunch tracking
- history and analytics
- reports and exports
- projects and categories
- settings and user preferences
- future AI-ready data model design

## 10. Phase 1 Deliverables

This document, plus the related architecture and database design documents, constitutes the approved Phase 1 package. The repository is not yet implementing feature code; it is establishing the blueprints required for future development. 

The next step, after approval, is Phase 2: project foundation and environment setup.
