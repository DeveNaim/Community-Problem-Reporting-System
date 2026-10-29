# Community Problem Reporting System — Build Instructions

## How to use

1. Open a **new Agent chat** (not inline/Ask).
2. `@PROMPT.md` and `@docs/SRS.md` — say: **"Execute Stage N only. Stop when done and summarize."**
3. Run the app yourself; verify before saying **"continue"**.
4. Do not proceed to the next stage until the user confirms.

## Source of truth

All requirements come from `docs/SRS.md`. Do not add features outside Section 3.1. Do not implement Section 3.2 (Out of Scope v1.0).

---

## Stage 1 — Phase 1: Requirements finalization, system design, DB schema

**SRS ref:** Sections 7, 8, 9, 10, 13

- [ ] MERN monorepo or split client/server scaffold (React SPA + Express API + MongoDB)
- [ ] Mongoose models: User, Complaint, Notification (Section 9)
- [ ] MVC structure: routes, controllers, models (Section 6 Maintainability)
- [ ] Base REST route groups per Section 10 (stubs OK)
- [ ] Responsive base UI scaffolding (Bootstrap or Tailwind per Section 8)

**Stop:** Summarize structure; confirm dev server and API health check run.

---

## Stage 2 — Phase 2: Auth module, User management, base UI scaffolding

**SRS ref:** Section 5.1 (FR-1.1–FR-1.5), Section 12

- [ ] FR-1.1: Citizen registration (name, email, phone, password)
- [ ] FR-1.2: Email validation; password min 8 chars, at least 1 number
- [ ] FR-1.3: Login with JWT (Authorization header on protected routes)
- [ ] FR-1.4: Forgot password via email reset link (Should-have)
- [ ] FR-1.5: View/edit own profile (Should-have)
- [ ] bcrypt password hashing; server-side RBAC middleware (Section 12)

**Stop:** Register, login, JWT-protected route tested via Postman or UI.

---

## Stage 3 — Phase 3 (part 1): Complaint submission

**SRS ref:** Section 5.2 (FR-2.1–FR-2.5)

- [ ] FR-2.1: Submit complaint (category, title, description, location, up to 3 images)
- [ ] FR-2.2: Predefined categories (Road Damage, Waste Management, Water Leakage, Streetlight, Drainage, Security, Other)
- [ ] FR-2.3: Auto-generate unique complaintId + timestamp
- [ ] FR-2.4: Default status `Pending Verification`
- [ ] FR-2.5: Image validation (jpg/png, max 5MB per file)
- [ ] Image storage per Section 8 (local or cloud — team decision per Section 13)

**Stop:** Citizen can submit a complaint with images; verify in DB.

---

## Stage 4 — Phase 3 (part 2): Complaint tracking (Citizen)

**SRS ref:** Section 5.3 (FR-3.1–FR-3.4), Section 11

- [ ] FR-3.1: List own complaints with status
- [ ] FR-3.2: Detail view with status history/timeline (statusHistory per Section 9.2)
- [ ] FR-3.3: In-app notification on status change (wire with notification module as statuses change)
- [ ] FR-3.4: Filter/search by status or category (Should-have)
- [ ] UI: My Complaints list, status badges, Submit New Complaint CTA (Section 11)

**Stop:** End-to-end citizen submit → list → detail with timeline.

---

## Stage 5 — Seed data (per Section 13 Assumptions)

**SRS ref:** Section 13 — *"Authorities … manually seeded/managed by Admin, not self-registered"*

- [ ] Seed script: admin user, authority user(s), sample citizen(s), sample complaints in varied statuses
- [ ] Document seeded credentials for QA

**Stop:** Run seed; log in as admin, authority, and citizen with seeded data.

---

## Stage 6 — Phase 4: Admin dashboard

**SRS ref:** Section 5.4 (FR-4.1–FR-4.5), Section 11

- [ ] FR-4.1: View all complaints; filters (status, category, date, authority)
- [ ] FR-4.2: Verify → Verified or Rejected (with reason)
- [ ] FR-4.3: Assign verified complaint to Authority
- [ ] FR-4.4: Manage users (view, disable/enable citizen and authority accounts)
- [ ] FR-4.5: Analytics view — volume by category, by status, resolution time trends (Should-have)
- [ ] Admin UI: complaint queue, filters, verify/assign detail panel (Section 11)

**Stop:** Admin verify → assign flow works; statusHistory logged (Section 6 Data Integrity).

---

## Stage 7 — Phase 5: Authority panel + Notification system

**SRS ref:** Sections 5.5, 5.6 (FR-5.1–FR-5.4, FR-6.1–FR-6.3)

- [ ] FR-5.1: List assigned complaints
- [ ] FR-5.2: Update status (In Progress, Resolved, Unable to Resolve)
- [ ] FR-5.3: Progress notes visible to Admin and citizen
- [ ] FR-5.4: Status update triggers citizen notification + timeline update
- [ ] FR-6.1: In-app notifications (verified, rejected, assigned, status updated, resolved)
- [ ] FR-6.2: Notification list; mark as read (Should-have)
- [ ] FR-6.3: Optional email notifications (Could-have)
- [ ] Authority UI per Section 11

**Stop:** Full workflow Section 7.1 steps 1–6; citizen receives notifications.

---

## Stage 8 — Phase 6–7: Reports, analytics, integration, UAT prep

**SRS ref:** Sections 5.7, 6, 12, 15

- [ ] FR-7.1: Export CSV complaint summary by date range (Should-have)
- [ ] FR-7.2: Dashboard metrics — total complaints, resolved %, avg resolution time (Should-have)
- [ ] Section 6: performance, browser support, security audit
- [ ] Section 15: all Must-have (M) requirements pass QA; Postman collection matches API
- [ ] README + deployment notes

**Stop:** Acceptance criteria Section 15 checklist complete.

---

## Out of scope (do not build)

Section 3.2: native mobile apps, payments, GIS pinning, i18n.
