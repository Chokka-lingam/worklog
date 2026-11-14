# WorkLog — Features and Modules

## 1. Module Overview

The application is organized as a set of business modules, each with clear responsibilities and data ownership. The implementation should remain feature-based and avoid mixing unrelated logic in a single page or service.

## 2. Module A — Authentication and User Management

### Features

- registration
- login/logout
- password reset
- session management
- profile editing
- time zone configuration
- workspace membership
- role-aware access control

### Core design

- use Supabase Auth for identity
- create a default personal workspace for each new user
- separate user profile data from workspace data
- allow role expansion later without major redesign

## 3. Module B — Main Dashboard

### Features

- today overview with date and rank metrics
- productive hours, break time, lunch time, target status
- completed vs pending tasks counts
- weekly and monthly snapshots
- recent activities
- quick access to task creation and timer controls

### KPI design rule

Every metric must have a clear calculation method. No opaque productivity scoring should be introduced in the initial release.

## 4. Module C — Task Management

### Goals

- create tasks with manual or timed workflows
- edit, delete, duplicate, and complete tasks
- search, filter, sort, and group by status/date/category/project
- maintain task notes and history

### Required fields

- title
- description
- project
- category
- priority
- status
- estimated duration
- actual duration
- dates and completion timestamps
- notes and tags

## 5. Module D — Real-Time Time Tracking

### Core functionality

- start, pause, resume, complete, cancel
- task timer with session persistence across refreshes
- independent break and lunch tracking
- accurate duration calculation from database timestamps
- safe transitions between task and break timers

### Important rules

- one active timer session per user
- no silent discard of active time
- browser timers only for display
- database timestamps are the authoritative source
- paused intervals must be excluded from productive totals

## 6. Module E — Task Templates

### Features

- create, edit, duplicate, search templates
- create task from template with prefilled values
- store default categories, projects, tags, and notes
- enable faster repetitive work setup

### Sample templates

- daily stand-up
- sprint planning
- bug investigation
- code review
- unit testing
- deployment validation
- knowledge transfer

## 7. Module F — Break and Lunch Management

### Features

- start/complete lunch and short breaks
- pause/resume support
- dedicated break history
- distinct reporting for productive time versus break and lunch time

### Reporting impact

- breaks and lunches are not counted as productive work
- these durations must remain visible and auditable

## 8. Module G — Activity History

### Views

- daily
- weekly
- monthly

### Features

- completed tasks
- in-progress tasks
- session start/end times
- task notes
- per-task and per-session history
- date and filter search
- manual corrections with reason tracking

## 9. Module H — Productivity Analytics

### Data views

- daily metrics
- weekly aggregate trends
- monthly trend analysis
- category and project distribution
- comparisons across date ranges

### Analytics rules

- exclude cancelled tasks from relevant productivity totals
- keep break time and lunch time out of productive calculations
- calculate using timezone-aware boundaries
- present incomplete or missing workdays accurately

## 10. Module I — Excel and PDF Reporting

### Excel export scope

- summary sheet
- daily summary sheet
- task details sheet
- session details sheet

### PDF export scope

- report title and metadata
- summary KPIs
- daily activity tables
- task details
- page numbering and formatting consistency

### Reporting requirement

The export layer must use the same time calculations as the dashboard and analytics modules to prevent mismatched numbers.

## 11. Module J — Projects and Categories

### Projects

- create, edit, archive, and safely delete if no data dependency
- color tags and descriptions
- project-level summary views

### Categories

- default categories plus custom ones
- user-defined and workspace-scoped
- no hardcoded category logic that prevents custom configuration

## 12. Module K — Settings and Preferences

### User preferences

- profile data
- daily productive target
- time zone
- preferred work days
- default project/category
- theme
- date and time display format

### Default timezone

The application should default new users to `Asia/Kolkata` unless another timezone is selected.

## 13. Module L — AI-Ready Future Extensions

The platform should keep historical and structured data available for future AI-assisted features without making AI mandatory in the initial release.

Examples:

- daily summary generation
- productivity pattern analysis
- task duration estimation
- recommendations based on historical work trends

## 14. Assumptions and Scope Boundaries

- The initial implementation supports a personal workspace and small-team ready architecture.
- The project is not designed for large enterprise admin complexity.
- AI support is deferred, not hardcoded into the MVP.
- The MVP must be robust and production-ready within the defined business scope without over-engineering.

This module breakdown forms the architecture basis for later phase implementation.
